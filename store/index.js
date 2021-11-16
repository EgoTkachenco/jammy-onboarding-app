import { makeAutoObservable, computed, configure } from 'mobx'
import jammy, { JAMMY_E, JAMMY_G } from '../jammy-web-util/services/jammy'
import midiService from '../jammy-web-util/services/midi'

configure({
  enforceActions: 'never',
})

class Store {
  isAdmin = false
  isPlaySound = true
  versions = null
  status = null
  jammyName = null
  isRebooted = false
  isInited = false
  isUpdating = false

  // START SCREEN TABS | Start, Welcome, Waiting, Denied, CheckFirmware, UpdateFirmware, Reboot |
  startScreenTab = 'Start'

  isPlaying = false
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
      } else if (
        ['MIDI function', 'MIDI Gadget', 'USB MIDI Device'].includes(input.name)
      ) {
        jammy.api = JAMMY_G
        this.jammyName = 'Jammy G'
      } else {
        // default guitar
        jammy.api = JAMMY_E
        this.jammyName = 'Jammy E'
      }
    } else {
      return Promise.reject()
    }
  }

  initJammy = () => {
    this.startScreenTab = 'Waiting'
    return midiService
      .init()
      .then(async () => {
        midiService.loadState()
        try {
          await this.defineGuitar()
          if (!this.jammyName) this.startScreenTab = 'Welcome'
          this.initStatusCheck()
          this.versions = {}
          if (this.jammyName === 'Jammy E') {
            this.updateFirmware()
          } else {
            this.isInited = true
            this.isRebooted = true
            this.startScreenTab = 'Reboot'
          }
          setTimeout(() => {
            jammy.sendVersionsRequest()
          }, 1000)
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
    this.jammyName === 'Jammy E'
      ? this.parseMidiMessageForE(e)
      : this.parseMidiMessageForG(e)
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
        midiService.midiAccess.inputs.size >= 1 ? 'Connected' : 'Disconnected'
      if (this.status !== newStatus && newStatus === 'Connected') {
        console.log('reinit')
        midiService.removeEventListener('midimessage', this.onMidiMessage)
        midiService.addEventListener('midimessage', this.onMidiMessage)
      }
      this.status = newStatus
    }, 500)
  }

  setIsUpdating = (isUpdating) => {
    this.isUpdating = isUpdating;
  }

  // For software-settings page back link
  isPresetsSkipped = false

  parseMidiMessageForE(event) {
    const jammyData = event.data
    const stringId = jammyData[6]
    if (stringId !== 0x7e && stringId !== 0x7f) {
      const groupId = jammyData[7]
      const paramId = jammyData[8]
      let value = midiService.to16BitInt(jammyData, 9)
      if (stringId === 6) {
        switch (groupId) {
          case 3: // FW Versions
            switch (paramId) {
              case 0: // Right part fw
                console.log('rf', value)
                this.versions = { ...this.versions, rf: value }
                break
              case 1: // Left part fw
                console.log('lf', value)
                this.versions = { ...this.versions, lf: value }
                break
              case 2: // Left part hw
                console.log('lh', value)
                this.versions = { ...this.versions, lh: value }
                break
              default:
                break
            }
            break
          default:
            break
        }
      }
    }
  }

  parseMidiMessageForG(event) {
    if (event.data.length === 39) {
      const jammyData = jammy.unpackJammySysexForG(event.data)
      if (jammyData.length > 0) {
        switch (jammyData[0]) {
          case 8:
            // Versions info
            this.versions = { lf: jammyData[3], rf: jammyData[8] }
            break
          default:
            break
        }
      }
    }
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
