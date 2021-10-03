import React from 'react'
import { Component } from 'react'
import { Col, Row, Button } from 'reactstrap'
import jammy from '../../../services/jammy'
import { sleep } from '../../../services/utils'

// import './Test.css'

function LedState(id, color, title) {
  return {
    id: id,
    color: color,
    title: title,
  }
}

class LedTest extends Component {
  constructor(props) {
    super(props)

    this.state = {
      currentState: 0,
    }

    this.states = [
      LedState(0, 'led-red', 'Red'),
      LedState(1, 'led-green', 'Green'),
      LedState(2, 'led-blue', 'Blue'),
    ]

    this.onYesClick = this.onYesClick.bind(this)
    this.onNoClick = this.onNoClick.bind(this)
    this.getCurrentLed = this.getCurrentLed.bind(this)
    this.getCurrentLedClass = this.getCurrentLedClass.bind(this)
  }

  onYesClick = async () => {
    let currentState = this.state.currentState
    console.log('Current state: ', currentState)

    if (currentState < this.states.length - 1) {
      this.currentLed = this.currentLed + 1
      this.setState({
        currentState: currentState + 1,
      })
    } else {
      console.log('Finish')
      this.currentLed = -1
      this.props.onTestResult !== undefined && this.props.onTestResult(true)
    }
  }

  onNoClick = async () => {
    console.log('Failed')
    this.props.onTestResult !== undefined && this.props.onTestResult(false)
  }

  sendLedColor(id, value) {
    console.log('Send led color: ', id, ', with value: ', value)
    jammy.sendParamRequest('set', {
      groupId: 2,
      paramId: id,
      stringId: 6,
      left: false,
      value: value,
    })
  }

  async startTest() {
    while (this.currentLed >= 0) {
      if (this.currentLed !== this.previousLed) {
        // Reset previous led to 0
        this.sendLedColor(this.previousLed, 0)
      }
      this.previousLed = this.currentLed
      // Blink with current
      this.sendLedColor(this.currentLed, 255)
      await sleep(100)
    }
  }

  componentDidMount() {
    this.previousLed = 0
    this.currentLed = 0

    this.startTest().then(() => {
      // Finish
      this.sendLedColor(2, 0)
    })
  }

  componentWillUnmount() {
    this.previousLed = -1
    this.currentLed = -1
  }

  getCurrentLed = () => {
    return this.states[this.state.currentState]
  }

  getCurrentLedClass = () => {
    return this.getCurrentLed().color
  }

  render() {
    const ledClass = 'led ' + this.getCurrentLedClass()
    return (
      <Col className="test">
        <Row className="justify-content-md-center">
          <div className={ledClass}></div>
        </Row>
        <Row className="test-lb justify-content-md-center">
          Led is {this.getCurrentLed().title}?
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

export default LedTest
