import React, { Component } from "react";

import MidiPortList from "./MidiPortList";
import midiService from "../../services/midi";
// import "./BindPorts.css";

export default class BindPorts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      logIncoming: midiService.logIncoming,
      logOutgoing: midiService.logOutgoing
    };

    try {
      this.state.selected_inputs = midiService.activeInputs.map(x => x.id);
      this.state.selected_outputs = midiService.activeOutputs.map(x => x.id);
      console.log(this.state);
    } catch (e) {
      console.log(e);
    }

    this.bindMidiPorts = this.bindMidiPorts.bind(this);
    this.setIncomingLogging = this.setLogging.bind(this, "in");
    this.setOutgoingLogging = this.setLogging.bind(this, "out");
    this.onSelectedPortChanged = this.onSelectedPortChanged.bind(this);
  }

  bindMidiPorts(e) {
    console.log("bind");
    midiService.bindPorts(this.state.selected_inputs, this.state.selected_outputs);
    midiService.logIncoming = this.state.logIncoming || true;
    midiService.logOutgoing = this.state.logOutgoing || true;
    // localStorage.setItem("midi.bindPorts.state", JSON.stringify(this.state));
    midiService.saveState();
  }

  onSelectedPortChanged(name, selection) {
    console.log(name, selection);
    this.setState({ ["selected_" + name]: selection });
  }

  setLogging(direction, e) {
    if (direction === "in") {
      midiService.logIncoming = e.target.checked;
      this.setState({ logIncoming: midiService.logIncoming });
    } else if (direction === "out") {
      midiService.logOutgoing = e.target.checked;
      this.setState({ logOutgoing: midiService.logOutgoing });
    }
  }

  componentDidMount() {
    // this.bindMidiPorts();
  }

  render() {
    console.log("Re");
    return (
      <div>
        <div className="d-flex" >
          <div>
            <p>Input ports:</p>
            <MidiPortList
              ports={(midiService.midiAccess && midiService.midiAccess.inputs) || []}
              selectedItems={this.state.selected_inputs}
              onSelectionChanged={e => this.onSelectedPortChanged("inputs", e)}
            />
            <div>
              <label>
                <input
                  type="checkbox"
                  onChange={this.setIncomingLogging}
                  checked={this.state.logIncoming}
                  value="true"
                />
                Log incoming
              </label>
            </div>
          </div>
          <div className="middle">
            <button onClick={this.bindMidiPorts}>Bind</button>
          </div>
          <div>
            <p>Output ports:</p>
            <MidiPortList
              ports={(midiService.midiAccess && midiService.midiAccess.outputs) || []}
              selectedItems={this.state.selected_outputs}
              onSelectionChanged={e => this.onSelectedPortChanged("outputs", e)}
            />
            <div>
              <label>
                <input
                  type="checkbox"
                  onChange={this.setOutgoingLogging}
                  checked={this.state.logOutgoing}
                  value="true"
                />
                Log outgoing
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
