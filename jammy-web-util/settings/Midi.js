import React, { Component } from "react";
import midiService from "../../services/midi";
import BindPorts from "./BindPorts";
import jammy from "../../services/jammy";

class Midi extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    console.log("mount");
    midiService.init().finally(() => {
      midiService.loadState();
      this.forceUpdate();
    });
  }

  render() {
    return (
      <div className="my-3 mx-auto" style={{ maxWidth: "960px" }}>
        <h1>Midi Settings</h1>
        {midiService.midiAccess && (
          <div>
            <BindPorts />
          </div>
        )}{" "}
        <div>
          <button
            onClick={() => {
              jammy.sendStandardTuning();
            }}
          >
            Standard Tuning
          </button>

          <button
            onClick={() => {
              jammy.sendVersionsRequest();
            }}
          >
            Versions
          </button>
        </div>
      </div>
    );
  }
}

export default Midi;
