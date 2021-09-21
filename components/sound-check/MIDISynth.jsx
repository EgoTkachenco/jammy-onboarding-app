import React, { Component } from 'react'
import CustomMIDISounds from './CustomMIDISounds'
import audioFile from './audio_base64.json'
const myCustomSampledInstrument = {
  zones: [
    {
      midi: 0, //MIDI program
      originalPitch: 37 * 100 + 11 * 100, //root pitch in cent, may be transpose up/down
      keyRangeLow: 12 * 3 + 6, //zone low key
      keyRangeHigh: 127, //zone high key
      loopStart: 0, //loop tart in seconds
      loopEnd: 763998, //loop end in seconds
      coarseTune: 0, //use fine tune
      fineTune: -11, //tune correction in cents
      sampleRate: 48000, //file sample rate
      ahdsr: true, // see example
      file: audioFile.audio.data,
    },
  ],
}
const DEFAULT_INSTRUMENT = 253
const SHOW_INSTRUMENTS = false
const SHOW_STATUS = false

class MIDISynth extends Component {
  constructor(props) {
    super(props)
    this.midiNotes = []
    this.state = {
      selectedInstrument: DEFAULT_INSTRUMENT,
      status: '?',
    }
  }
  componentDidMount() {
    this.envelopes = []
    this.startListening()
  }
  onSelectInstrument(e) {
    var list = e.target
    let n = list.options[list.selectedIndex].getAttribute('value')
    this.setState({
      selectedInstrument: n,
    })
    this.midiSounds.cacheInstrument(n)
  }
  createSelectItems() {
    if (this.midiSounds) {
      if (!this.items) {
        this.items = []
        for (
          let i = 0;
          i < this.midiSounds.player.loader.instrumentKeys().length;
          i++
        ) {
          this.items.push(
            <option key={i} value={i}>
              {'' +
                (i + 0) +
                '. ' +
                this.midiSounds.player.loader.instrumentInfo(i).title}
            </option>
          )
        }
      }
      return this.items
    }
  }
  keyDown(n, v) {
    this.keyUp(n)
    var volume = 1
    if (v) {
      volume = v
    }
    this.envelopes[n] = this.midiSounds.player.queueWaveTable(
      this.midiSounds.audioContext,
      this.midiSounds.equalizer.input,
      myCustomSampledInstrument,
      0,
      n,
      9999,
      volume
    )
    this.setState(this.state)
  }
  keyUp(n) {
    if (this.envelopes) {
      if (this.envelopes[n]) {
        this.envelopes[n].cancel()
        this.envelopes[n] = null
        this.setState(this.state)
      }
    }
  }
  midiOnMIDImessage(event) {
    var data = event.data
    //		var cmd = data[0] >> 4;
    //		var channel = data[0] & 0xf;
    var type = data[0] & 0xf0
    var note = data[1]
    var velocity = data[2]
    switch (type) {
      case 144:
        this.keyDown(note, velocity / 127)
        break
      case 128:
        this.keyUp(note)
        break
      default:
        break
    }
  }

  onMIDIOnStateChange(event) {
    this.setState({
      status:
        event.port.manufacturer +
        ' ' +
        event.port.name +
        ' ' +
        event.port.state,
    })
  }
  requestMIDIAccessSuccess(midi) {
    console.log(midi)
    var inputs = midi.inputs.values()
    for (
      var input = inputs.next();
      input && !input.done;
      input = inputs.next()
    ) {
      input.value.onmidimessage = this.midiOnMIDImessage.bind(this)
    }
    midi.onstatechange = this.onMIDIOnStateChange.bind(this)
  }
  requestMIDIAccessFailure(e) {
    console.log('requestMIDIAccessFailure', e)
    this.setState({ status: 'MIDI Access Failure' })
  }
  startListening() {
    this.setState({ status: 'waiting' })
    if (navigator.requestMIDIAccess) {
      navigator
        .requestMIDIAccess()
        .then(
          this.requestMIDIAccessSuccess.bind(this),
          this.requestMIDIAccessFailure.bind(this)
        )
    } else {
      this.setState({ status: 'navigator.requestMIDIAccess undefined' })
    }
  }
  render() {
    return (
      <div>
        {SHOW_INSTRUMENTS && (
          <p>
            <select
              value={this.state.selectedInstrument}
              onChange={this.onSelectInstrument.bind(this)}
            >
              {this.createSelectItems()}
            </select>
          </p>
        )}
        {SHOW_STATUS && <p>Status: {this.state.status}</p>}
        <CustomMIDISounds
          ref={(ref) => (this.midiSounds = ref)}
          appElementName="root"
          //   instruments={[this.state.selectedInstrument]}
        />
      </div>
    )
  }
}

export default MIDISynth
