import { makeAutoObservable } from 'mobx'
import * as Tone from 'tone'

const GUITAR_NOTES_CODE = {
  40: 'E2',
  41: 'F2',
  42: 'F#2',
  43: 'G2',
  44: 'G#2',
  45: 'A2',
  46: 'A#2',
  47: 'B2',
  48: 'C3',
  49: 'C#3',
  50: 'D3',
  51: 'D#3',
  52: 'E3',
  53: 'F3',
  54: 'F#3',
  55: 'G3',
  56: 'G#3',
  57: 'A3',
  58: 'A#3',
  59: 'B3',
  60: 'C4',
  61: 'C#4',
  62: 'D4',
  63: 'D#4',
  64: 'E4',
  65: 'F4',
  66: 'F#4',
  67: 'G4',
  68: 'G#4',
  69: 'A4',
  70: 'A#4',
  71: 'B4',
  72: 'C5',
  73: 'C#5',
  74: 'D5',
  75: 'D#5',
  76: 'E5',
  77: 'F5',
  78: 'F#5',
  79: 'G5',
  80: 'G#5',
  81: 'A5',
  82: 'A#5',
  83: 'B5',
}

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
    this.isIniting = true
    let params = {
      urls: {
        // E2: 'E2.mp3',
        C2: 'C2.mp3',
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
    this.synth = new Tone.Sampler(params).toDestination()
    this.isIniting = false
    this.now = Tone.now()
  }

  async handleMidiMessage(e) {
    let type = e.data[0] & 0xf0
    let note = e.data[1]
    let velocity = e.data[2]

    if (type === 144) this.playNote(note, velocity)
    if (type === 128) this.stopNote(note)
  }

  stopNote = (note) => {
    this.synth.triggerRelease(GUITAR_NOTES_CODE[note], this.now + 10)
  }
  playNote(note, velocity) {
    console.log(GUITAR_NOTES_CODE[note])
    this.synth.triggerAttack(GUITAR_NOTES_CODE[note])
  }
}

const store = new MidiStore()
export default store
