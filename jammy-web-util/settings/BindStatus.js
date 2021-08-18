import React, { Component } from 'react'

import midi from '../services/midi'
import MidiPortStatusList from './MidiPortStatusList'

export default class BindStatus extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selected_inputs: [],
      selected_outputs: [],
    }
    midi.addEventListener('midistatus', () => {
      this.setState({
        selected_inputs: midi.activeInputs,
        selected_outputs: midi.activeOutputs,
      })
      console.log(this.state)
    })
  }

  componentDidMount() {
    try {
      this.setState({
        selected_inputs: midi.activeInputs,
        selected_outputs: midi.activeOutputs,
      })
      console.log(this.state)
    } catch (e) {
      console.log(e)
    }
  }

  render() {
    console.log('BindStatus: rend', this.state.selected_inputs || [])
    return (
      <div>
        <div className="container-fluid">
          <div className="row">
            <div className="col-sm">
              In:
              <MidiPortStatusList ports={this.state.selected_inputs || []} />
            </div>
            <div className="col-sm">
              Out:
              <MidiPortStatusList ports={this.state.selected_outputs || []} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}
