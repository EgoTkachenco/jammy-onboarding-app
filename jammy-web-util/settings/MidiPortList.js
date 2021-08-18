import React, { Component } from "react";

export default class MidiPortList extends Component {
  constructor(props) {
    super(props);

    this.selectRef = React.createRef();
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.handleChange(this.selectRef.current);
  }

  handleChange(element) {
    let values = [...element.options].filter(o => o.selected).map(o => o.value);
    if (this.props.onSelectionChanged)
      this.props.onSelectionChanged(values);
  }

  buildListItems(ports) {
    let items = [];

    for (let port of ports.values()) {
      items.push(
        <option key={port.id} value={port.id}>
          {port.name} ({port.state}, {port.connection}, {port.manufacturer})
        </option>
      );
    }

    return items;
  }

  render() {
    return (
      <select
        multiple={true}
        onChange={event => this.handleChange(event.target)}
        ref={this.selectRef}
        value={this.props.selectedItems}
      >
        {this.buildListItems(this.props.ports)}
      </select>
    );
  }
}

MidiPortList.defaultProps = {
  selectedItems: []
};
