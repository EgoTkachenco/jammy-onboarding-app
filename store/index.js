import { makeAutoObservable, computed, configure } from 'mobx'
import jammy, { JAMMY_E, JAMMY_G } from '../jammy-web-util/services/jammy'
import midiService from '../jammy-web-util/services/midi'

configure({
  enforceActions: 'never',
})
class Store {
  status = null
  jammyName = null
  get midiService() {
    return midiService
  }
  get jammy() {
    return jammy
  }
  isPlaying = false
  isPlayingTime = null
  constructor() {
    makeAutoObservable(this, { midiService: computed, jammy: computed })
  }

  initJammy = () => {
    return this.midiService.init().then(() => {
      this.midiService.loadState()
      if (this.midiService.midiAccess) {
        let input
        debugger
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
          return
        }
        return new Promise.reject('No Input')
      } else {
        // throw Error('denied')
      }
    })
  }
}

const store = new Store()
export default store

export { midiService, jammy }
