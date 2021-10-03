import React from 'react'
import {
  Container,
  InputGroup,
  InputGroupAddon,
  Button,
  Input,
  Label,
  Col,
  Row,
} from 'reactstrap'
import jammy from '../../services/jammy'
import ProgressIndicator from './widget/ProgressIndicator'

// import './tests/Test.css'

// 2109J12DC00001
class SerialNumber extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      progress: false,
      valid: false,
      serial: '',
    }
  }

  currentDate = () => {
    const date = new Date()
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    return {
      day: day,
      month: month,
      year: year,
    }
  }

  currentTime = () => {
    const date = new Date()
    return this.secondsSinceEpoch(date)
  }

  componentDidMount() {
    // midi.logOutgoing = true
    // midi.logIncoming = true

    jammy.registerJammyEMetaData()
    this.requestSerialData()
  }

  componentWillUnmount() {
    jammy.unregisterJammyEMetaData()
  }

  requestSerialData = () => {
    jammy.onJammyESerial = (serial) => {
      console.log('New serial: ', serial)
      this.props.onSerial(serial)
      if (this.state.progress) {
        this.setState({
          progress: false,
        })
        if (this.state.serial === serial) {
          this.testPassed()
        } else {
          this.testFailed()
        }
      }
      this.setState({
        serial: serial,
      })
    }
    jammy.sendJammyEMetaDataRequest()
  }

  secondsSinceEpoch = (d) => {
    return Math.floor(d / 1000)
  }

  testPassed() {
    this.props.onTestResult !== undefined && this.props.onTestResult(true)
  }

  testFailed = () => {
    this.props.onTestResult !== undefined && this.props.onTestResult(false)
  }

  updateSerial = () => {
    this.setState({
      progress: true,
    })
    console.log('Serial: ', this.state.serial)
    let date = this.currentDate()
    let dateStr =
      '' +
      (date.day < 10 ? '0' : '') +
      date.day +
      (date.month < 10 ? '0' : '') +
      date.month +
      date.year
    console.log('Current data: ', dateStr)
    console.log('Current time: ', this.currentTime())
    jammy
      .updateJammyEMetaData(
        this.state.serial,
        parseInt(dateStr, 10),
        this.currentTime()
      )
      .then((e) => {
        // Finished
        this.requestSerialData()
      })
  }

  verifyPattern = (input) => {
    return (
      input.startsWith('2109J12DE') ||
      input.startsWith('2109J22DE') ||
      input.startsWith('2109J12DF') ||
      input.startsWith('2109J22DF')
    )
  }

  validateValue = (input) => {
    const verifiedPattern = this.verifyPattern(input)
    const valid = input.length === 14 && this.verifyPattern(input)
    this.setState({
      valid: valid,
      wrongPatter: input.length === 14 && !verifiedPattern,
      serial: valid ? input : '',
    })
  }

  render() {
    return (
      <div>
        <Container className="container-fluid">
          <Col className="test">
            <Row>
              <Label for="serialNumber">Jammy E Serial Number</Label>
            </Row>
            <Row>
              <InputGroup>
                {/**  value={this.state.serial}  */}
                <Input
                  type="text"
                  name="serial"
                  id="serialNumber"
                  placeholder="Enter Serial"
                  onChange={(e) => this.validateValue(e.target.value)}
                />
                <InputGroupAddon addonType="append">
                  <Button
                    color="secondary"
                    disabled={!this.state.valid || this.state.progress}
                    onClick={() => this.updateSerial()}
                  >
                    Update
                  </Button>
                </InputGroupAddon>
              </InputGroup>
            </Row>
            <Row>
              {this.state.wrongPatter && (
                <Label>!!! Wrong Serial number pattern</Label>
              )}
            </Row>
            {this.state.progress && (
              <Row className="test-st justify-content-md-center">
                <ProgressIndicator />
              </Row>
            )}
          </Col>
        </Container>
      </div>
    )
  }
}

export default SerialNumber
