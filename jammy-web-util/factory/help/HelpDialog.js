import { Button } from 'reactstrap';
import React from 'react';

export default class HelpImageDialog extends React.Component {

  constructor(props) {
    super(props);
    this.state = { isOpen: false };
    this.handleShowDialog = this.handleShowDialog.bind(this);
  }


  handleShowDialog = () => {
    this.setState({ isOpen: !this.state.isOpen });
  };

  render() {
    return (
      <div>
        <Button onClick={this.handleShowDialog}>{this.props.title}</Button>
        {this.state.isOpen && (
          <dialog
            className="dialog"
            style={{ position: 'absolute' , zIndex: 1 }}
            open
            onClick={this.handleShowDialog}
          >
            <img
              className="image"
              src={this.props.image}
              width='500'
              onClick={this.handleShowDialog}
              alt="Help"
            />
          </dialog>
        )}
      </div>
    );
  }
}