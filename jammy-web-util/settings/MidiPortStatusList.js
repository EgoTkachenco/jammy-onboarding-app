import React, { Component, } from "react";

export default class MidiPortStatusList extends Component {

  buildListItems(ports) {
    let items = [];
    for (let port of ports.values()) {
      items.push(
        <div className="p-2 mb-2 bg-success text-white" key={port.id}>
          {port.name} ({port.state}, {port.connection}, {port.manufacturer})
        </div>
      );
    }
    return items;
  }

  render() {
    let items = this.buildListItems(this.props.ports);
    if (items.length === 0) {
      return <div className="p-2 mb-2 bg-danger text-white" >Jammy Not connected</div>;
    } else {
      return <div>{items}</div>;
    }
  }
}