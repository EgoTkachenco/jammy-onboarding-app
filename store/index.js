import { makeAutoObservable, computed, configure } from 'mobx'
import jammy, { JAMMY_E, JAMMY_G } from '../jammy-web-util/services/jammy'
import midiService from '../jammy-web-util/services/midi'

configure({
  enforceActions: 'never',
})
class Store {
  status = null
  jammyName = null
  isRebooted = false
  isInited = false
  // START SCREEN TABS | Welcome, Waiting, Denied, CheckFirmware, UpdateFirmware, Reboot |
  startScreenTab = 'Welcome'

  isPlaying = false
  isPlayingTime = null
  constructor() {
    makeAutoObservable(this, {
      midiService: computed,
      jammy: computed,
    })
  }

  initJammy = () => {
    this.startScreenTab = 'Waiting'
    return midiService.init().then(() => {
      midiService.loadState()
      if (midiService.midiAccess.inputs.size > 0) {
        let input
        for (const inp of midiService.midiAccess.inputs) {
          input = inp[1]
        }
        if (input) {
          if (
            ['MIDI function', 'MIDI Gadget', 'USB MIDI Device'].includes(
              input.name
            )
          ) {
            jammy.api = JAMMY_G
            this.jammyName = 'Jammy G'
          } else if (['Jammy EVO', 'Jammy E'].includes(input.name)) {
            jammy.api = JAMMY_E
            this.jammyName = 'Jammy E'
          }
          // Check jammy status
          let statusCheckInterval = setInterval(() => {
            this.status =
              midiService.midiAccess.inputs.size === 1
                ? 'Connected'
                : 'Disconnected'
          }, 2000)
          // Midi Access and Jammy detected
          this.startScreenTab = 'CheckFirmware'
          console.log('Version: ', input.version)
          if (!this.isRebooted) {
            setTimeout(() => {
              this.startScreenTab = 'UpdateFirmware'
              setTimeout(() => {
                this.startScreenTab = 'Reboot'
                // Wait untill jammy off
                let interval = setInterval(() => {
                  if (!this.isRebooted && this.status === 'Disconnected') {
                    clearInterval(interval)
                    // wait until jammy on
                    this.isRebooted = true
                    interval = setInterval(() => {
                      if (this.status === 'Connected') {
                        clearInterval(interval)
                        clearInterval(statusCheckInterval)
                      }
                    }, 1000)
                  }
                }, 1000)
              }, 4000)
            }, 4000)
          } else {
            this.isInited = true
            midiService.addEventListener('midimessage', (e) => {
              if (this.isPlaying && this.isPlayTime) {
                clearTimeout(this.isPlayTime)
              } else {
                this.isPlaying = true
              }
              this.isPlayTime = setTimeout(() => {
                this.isPlaying = false
                clearTimeout(this.isPlayTime)
              }, 1000)
            })
            return Promise.resolve(true)
          }
          return Promise.reject('Updating')
        } else {
          return Promise.reject('No Input')
        }
      } else {
        this.startScreenTab = 'Denied'
      }
    })
  }

  get midiService() {
    return midiService
  }
  get jammy() {
    return jammy
  }
}

const store = new Store()
export default store

export { midiService, jammy }
