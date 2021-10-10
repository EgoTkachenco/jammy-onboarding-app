import { makeAutoObservable, computed, configure } from 'mobx'
import jammy, { JAMMY_E, JAMMY_G } from '../jammy-web-util/services/jammy'
import midiService from '../jammy-web-util/services/midi'
// import MidiStore from './MidiStore'
configure({
  enforceActions: 'never',
})
class Store {
  isAdmin = false
  status = null
  jammyName = null
  isRebooted = false
  isInited = false
  // START SCREEN TABS | Start, Welcome, Waiting, Denied, CheckFirmware, UpdateFirmware, Reboot |
  startScreenTab = 'Start'

  isPlaying = false
  isPlayingTime = null

  statusCheckInterval = null
  constructor() {
    makeAutoObservable(this, {
      midiService: computed,
      jammy: computed,
    })
  }
  defineGuitar = async () => {
    this.jammyName = null
    if (midiService.midiAccess.inputs.size > 0) {
      let input
      for (const inp of midiService.midiAccess.inputs) {
        input = inp[1]
      }
      if (['Jammy EVO', 'Jammy E'].includes(input.name)) {
        jammy.api = JAMMY_E
        this.jammyName = 'Jammy E'
      } else {
        // jammy G names ['MIDI function', 'MIDI Gadget', 'USB MIDI Device'].includes(input.name)
        jammy.api = JAMMY_G
        this.jammyName = 'Jammy G'
      }
    } else {
      return Promise.reject()
    }
  }
  initJammy = (path) => {
    this.startScreenTab = 'Waiting'
    return midiService
      .init()
      .then(async () => {
        midiService.loadState()
        try {
          await this.defineGuitar()
          if (!this.jammyName) this.startScreenTab = 'Welcome'
          this.initStatusCheck()
          if (this.jammyName === 'Jammy E') {
            this.updateFirmware()
          } else {
            this.isInited = true
            this.isRebooted = true
            this.startScreenTab = 'Reboot'
          }
        } catch (err) {
          this.startScreenTab = 'Welcome'
        }
      })
      .catch(() => {
        if (this.startScreenTab !== 'Welcome') this.startScreenTab = 'Denied'
        // return Promise.reject()
      })
  }
  onMidiMessage = (e) => {
    let type = e.data[0] & 0xf0
    // MidiStore.handleMidiMessage(e)
    if (type === 144) {
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
  }
  updateFirmware = async () => {
    this.startScreenTab = 'CheckFirmware'
  }
  initStatusCheck = () => {
    // Check jammy status
    this.statusCheckInterval = setInterval(() => {
      let newStatus =
        midiService.midiAccess.inputs.size === 1 ? 'Connected' : 'Disconnected'
      if (this.status !== newStatus && newStatus === 'Connected') {
        console.log('reinit')
        midiService.removeEventListener('midimessage', this.onMidiMessage)
        midiService.addEventListener('midimessage', this.onMidiMessage)
      }
      this.status = newStatus
    }, 500)
  }
  clearStatusCheck = () => {
    clearInterval(this.statusCheckInterval)
    this.statusCheckInterval = null
  }
  // For software-settings page back link
  isPresetsSkipped = false

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
