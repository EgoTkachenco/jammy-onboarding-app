import { makeAutoObservable } from 'mobx'
import { jammy } from './index'
import PresetsStore from './PresetsStore'
import * as Tone from 'tone'

const GUITAR_NOTES = {
  1: {
    0: 'E2',
    1: 'F2',
    2: 'F#2',
    3: 'G2',
    4: 'G#2',
    5: 'A2',
    6: 'A#2',
    7: 'B2',
    8: 'C3',
    9: 'C#3',
    10: 'D3',
    11: 'D#3',
    12: 'E3',
  },
  2: {
    0: 'A2',
    1: 'A#2',
    2: 'B2',
    3: 'C3',
    4: 'C#3',
    5: 'D3',
    6: 'D#3',
    7: 'E3',
    8: 'F3',
    9: 'F#3',
    10: 'G3',
    11: 'G#3',
    12: 'A3',
  },
  3: {
    0: 'D3',
    1: 'D#3',
    2: 'E3',
    3: 'F3',
    4: 'F#3',
    5: 'G3',
    6: 'G#3',
    7: 'A3',
    8: 'A#3',
    9: 'B3',
    10: 'C4',
    11: 'C#4',
    12: 'D4',
  },
  4: {
    0: 'G3',
    1: 'G#3',
    2: 'A3',
    3: 'A#3',
    4: 'B3',
    5: 'C4',
    6: 'C#4',
    7: 'D4',
    8: 'D#4',
    9: 'E4',
    10: 'F4',
    11: 'F#4',
    12: 'G4',
  },
  5: {
    0: 'B3',
    1: 'C4',
    2: 'C#4',
    3: 'D4',
    4: 'D#4',
    5: 'E4',
    6: 'F4',
    7: 'F#4',
    8: 'G4',
    9: 'G#4',
    10: 'A4',
    11: 'A#4',
    12: 'B4',
  },
  6: {
    0: 'E4',
    1: 'F4',
    2: 'F#4',
    3: 'G4',
    4: 'G#4',
    5: 'A4',
    6: 'A#4',
    7: 'B4',
    8: 'C5',
    9: 'C#5',
    10: 'D5',
    11: 'D#5',
    12: 'E5',
  },
}

class MidiStore {
  isIniting = false
  tone_sampler = null
  synth = null
  now = null
  stringIds = {
    1: 5,
    2: 4,
    3: 3,
    4: 2,
    5: 1,
    6: 0,
  }
  riff = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  }
  constructor() {
    makeAutoObservable(this)
  }

  async initMidiStore() {
    debugger
    this.isIniting = true
    let params = {
      urls: {
        E2: 'E2.mp3',
        // C2: 'C2.mp3',
        // 'C#2': 'Cb2.mp3',
        // D2: 'D2.mp3',
        // 'D#2': 'Db2.mp3',
        // F2: 'F2.mp3',
        // Fb2: 'Fb2.mp3',
        // G2: 'G2.mp3',
        // 'G#2': 'Gb2.mp3',
        // A2: 'A2.mp3',
        // 'A#2': 'Ab2.mp3',
        // B2: 'B2.mp3',
        // C3: 'C3.mp3',
      },
      baseUrl: '/audio/',
    }
    let sampler = new Tone.Sampler(params).toDestination()
    // await PresetsStore.sendAllParamsRequest('get')
    // await Tone.loaded()
    // sampler.triggerAttackRelease('C3', '1n')
    this.synth = {
      1: new Tone.Sampler(params).toDestination(),
      2: new Tone.Sampler(params).toDestination(),
      3: new Tone.Sampler(params).toDestination(),
      4: new Tone.Sampler(params).toDestination(),
      5: new Tone.Sampler(params).toDestination(),
      6: new Tone.Sampler(params).toDestination(),
    }
    // this.synth = {
    //   1: sampler,
    //   2: sampler,
    //   3: sampler,
    //   4: sampler,
    //   5: sampler,
    //   6: sampler,
    // }
    this.isIniting = false
    this.now = Tone.now()
  }
  async handleMidiMessage(e) {
    let msg = this.parseMidiEvent(e.data)
    if (!this.synth || this.isIniting) return
    if (msg.type) {
      this.onSoundEvent(msg, e.data)
    } else if (!msg.type) {
      let data = jammy.unpackJammySysexForG(e.data)
      let fret = data[5]
      let string = [6, 5, 4, 3, 2, 1][data[1]]
      console.log(data)
      if (fret === undefined || !string) {
        console.log(e.data)
      } else {
        this.riff[string] = fret
        this.playNote(string)
      }
    }
  }

  onSoundEvent(msg) {
    if (msg.type === 'Note ON') {
      jammy.sendFretRequestForG(this.stringIds[msg.ch])
    } else if (msg.type === 'Note OFF') {
      console.log(msg.type, msg.ch)
      let note = GUITAR_NOTES[msg.ch][this.riff[msg.ch]]
      console.log('Note', note, msg.ch, this.now)
      this.synth[msg.ch].triggerRelease(note, this.now + 1)
    } else if (msg.type === 'Pitch Band') {
      jammy.sendFretRequestForG(this.stringIds[msg.ch])
    } else if (msg.type === 'CC') {
      // console.log(msg.ch)
      // jammy.sendFretRequestForG(this.stringIds[msg.ch])
    }
  }
  playNote(ch) {
    let note = GUITAR_NOTES[ch][this.riff[ch]]
    console.log('Note', note, ch)
    this.synth[ch].triggerAttack(note)
  }
  // handle(string, fret, segment) {
  //   debugger
  //   // jammy.requestJammyESegmentWires(() => { return this.launched }, [0, 1, 2, 3, 4, 5]).then(() => {
  //   //     // Finish
  //   // })
  // }

  parseMidiEvent = (midiData) => {
    if (midiData.length === 3) {
      const cmd = midiData[0] >> 4
      const ch = midiData[0] & 0x0f

      switch (cmd) {
        case 8:
          return {
            type: 'Note OFF',
            ch: ch,
            note: midiData[1],
            val: midiData[2],
          }
        case 9:
          return {
            type: 'Note ON',
            ch: ch,
            note: midiData[1],
            val: midiData[2],
          }
        case 0xb:
          return {
            type: 'CC',
            ch: ch,
            Ctrl: midiData[1],
            val: midiData[2],
          }
        case 0xe:
          let val = (midiData[2] << 7) + midiData[1]
          return {
            type: 'Pitch Band',
            ch: ch,
            val: val,
            note: midiData[1],
          }
        default:
          break
      }
    }

    if (midiData[0] === 0xf0) {
      return 'Sysex'
    }

    return 'Unknown'
  }
}

const store = new MidiStore()
export default store
