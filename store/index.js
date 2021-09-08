import { makeAutoObservable, computed, configure } from 'mobx'
import jammy, { JAMMY_E, JAMMY_G } from '../jammy-web-util/services/jammy'
import midiService from '../jammy-web-util/services/midi'
import MidiStore from './MidiStore'
configure({
  enforceActions: 'never',
})
class Store {
  isAdmin = false
  status = null
  jammyName = null
  isRebooted = false
  isInited = false
  // START SCREEN TABS | Welcome, Waiting, Denied, CheckFirmware, UpdateFirmware, Reboot |
  startScreenTab = 'Welcome'

  isPlaying = false
  isPlayingTime = null

  statusCheckInterval = null
  constructor() {
    makeAutoObservable(this, {
      midiService: computed,
      jammy: computed,
    })
  }

  initJammy = (path) => {
    this.startScreenTab = 'Waiting'
    return midiService
      .init()
      .then(() => {
        midiService.loadState()
        let isJammyNotConnected = true

        if (midiService.midiAccess.inputs.size > 0) {
          let input
          for (const inp of midiService.midiAccess.inputs) {
            input = inp[1]
          }
          if (
            ['MIDI function', 'MIDI Gadget', 'USB MIDI Device'].includes(
              input.name
            )
          ) {
            jammy.api = JAMMY_G
            this.jammyName = 'Jammy G'
            isJammyNotConnected = false
          } else if (['Jammy EVO', 'Jammy E'].includes(input.name)) {
            jammy.api = JAMMY_E
            this.jammyName = 'Jammy E'
            isJammyNotConnected = false
          }
          if (isJammyNotConnected) {
            this.startScreenTab = 'Welcome'
            return Promise.reject()
          } else {
            // Midi Access and Jammy detected
            this.initStatusCheck()
            if (this.jammyName === 'Jammy G' && input.version !== '4.1') {
              this.updateFirmware()
              return Promise.reject('Updating')
            } else if (
              this.jammyName === 'Jammy E' &&
              input.version !== '4.1'
            ) {
              return Promise.reject('Updating')
              // update soft
            } else {
              console.log(path)
              if (!MidiStore.synth && path !== '/sensitivity')
                MidiStore.initMidiStore()
              this.isInited = true
              // jammy.requestJammyESegmentWires(() => true, [0, 1, 2, 3, 4, 5])
              // jammy.onJammyESegmentWired = (fret, v) =>
              //   MidiStore.handle(fret, v)
              if (path !== '/sensitivity')
                midiService.addEventListener('midimessage', this.onMidiMessage)
              return Promise.resolve(true)
            }
          }
        } else {
          this.startScreenTab = 'Welcome'
          return Promise.reject()
        }
      })
      .catch(() => {
        if (this.startScreen !== 'Welcome') {
          this.startScreenTab = 'Denied'
          return Promise.reject()
        }
        return Promise.reject()
      })
  }
  onMidiMessage = (e) => {
    MidiStore.handleMidiMessage(e)

    if (this.isPlaying && this.isPlayTime) {
      clearTimeout(this.isPlayTime)
    } else {
      this.isPlaying = true
    }

    this.isPlayTime = setTimeout(() => {
      this.isPlaying = false
      clearTimeout(this.isPlayTime)
    }, 1000)
  }
  updateFirmware = () => {
    debugger
    this.startScreenTab = 'CheckFirmware'
    console.log('Version: ', midiService.activeInputs[0])
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
  }
  initStatusCheck = () => {
    // Check jammy status
    this.statusCheckInterval = setInterval(() => {
      let newStatus =
        midiService.midiAccess.inputs.size === 1 ? 'Connected' : 'Disconnected'
      if (this.status !== newStatus && newStatus === 'Connected') {
        midiService.removeEventListener('midimessage', this.onMidiMessage)
        midiService.addEventListener('midimessage', this.onMidiMessage)
      }
      // if (this.status !== newStatus && newStatus === 'Disconnected') {

      // }
      this.status = newStatus
    }, 2000)
  }
  clearStatusCheck = () => {
    clearInterval(this.statusCheckInterval)
    this.statusCheckInterval = null
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
