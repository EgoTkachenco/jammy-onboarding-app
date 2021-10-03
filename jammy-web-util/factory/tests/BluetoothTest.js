import React from 'react'
import { Col, Row, Button } from 'reactstrap'
// import './Test.css';

import macAddress from './bluetooth_mac_address.jpg' // with require
import jammy from '../../../services/jammy'

class BluetoothTest extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      mac: '00:00:00:00:00:00',
    }
    this.startTest.bind(this.startTest)
  }

  onYesClick = async () => {
    this.props.onTestResult !== undefined && this.props.onTestResult(true)
  }

  onNoClick = async () => {
    this.props.onTestResult !== undefined && this.props.onTestResult(false)
  }

  componentDidMount() {
    jammy.onJammyEMacAddress = (macAddress) => {
      this.setState({
        mac: macAddress,
      })
    }

    jammy.requestJammyEBLEMacAddress().then(() => console.log('Finish'))

    this.startTest().then({
      // Test finished
    })
  }
  async startTest() {
    // await sleep(2000);
    // const passed = true;
    // this.props.onTestResult(passed);
  }

  render() {
    return (
      <Col className="test">
        <Row className="ble ble-tl justify-content-md-center">
          Do you see Jammy E device with MAC:
        </Row>

        <Row className="ble ble-mac justify-content-md-center">
          {this.state.mac}
        </Row>

        <Row className="ble justify-content-md-center">?</Row>

        <Row className="justify-content-md-center">
          <img
            className="ble-img"
            src={macAddress}
            width="229"
            alt="Mac Address"
          />
        </Row>
        <Row className="test-st justify-content-md-center">
          <Col>
            <Row className="justify-content-md-center">
              <Button className="btn-ans" onClick={() => this.onYesClick()}>
                Yes
              </Button>
            </Row>
          </Col>

          <Col>
            <Row className="justify-content-md-center">
              <Button className="btn-ans" onClick={() => this.onNoClick()}>
                No
              </Button>
            </Row>
          </Col>
        </Row>
      </Col>
    )
  }
}

export default BluetoothTest
