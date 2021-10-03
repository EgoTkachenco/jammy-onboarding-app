import React from 'react'
import { Col, Row } from 'reactstrap'
import ProgressIndicator from '../widget/ProgressIndicator'

import jammy from '../../../services/jammy'

// import './Test.css'
import OneFret from '../widget/OneFret'

class TouchTest extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      active: [],
      touches: [-1, -1, -1, -1, -1, -1],
      requests: 0,
      responses: 0,
      response: '',
    }
    this.startTest.bind(this.startTest)
    this.addActive.bind(this.addActive)
  }

  handleStringUpdate = (string, note) => {
    this.setState({
      frets: this.addActive(this.state.active, string),
    })
    let count = this.state.active.length
    if (this.launched === true && count >= 6) {
      this.launched = false
      this.props.onTestResult !== undefined && this.props.onTestResult(true)
    }
  }

  initialTouchValues = undefined
  touched = []
  initialCounter = 0
  responses = 0
  requests = 0

  handleTouches = (touches) => {
    if (this.initialCounter++ >= 5 && this.initialTouchValues === undefined) {
      this.initialTouchValues = [...touches]
    }
    if (this.initialCounter >= 40) {
      for (var i = 0; i < 6; i++) {
        const diff = this.initialTouchValues[i] - touches[i]
        if (Math.abs(diff) > 25) {
          if (!this.touched.includes(i)) {
            this.touched.push(i)
          }
        }
      }
    }
    if (this.launched) {
      this.setState({
        active: this.touched,
        touches: touches,
        responses: this.responses++,
      })
    }

    if (this.touched.length >= 6) {
      this.props.onTestResult !== undefined && this.props.onTestResult(true)
    }
  }

  componentDidMount() {
    this.launched = true
    this.initialTouchValues = undefined
    this.touched = []
    this.initialCounter = 0
    this.responses = 0
    this.requests = 0
    jammy.debugTouches = true

    // Handle touch for right part
    jammy.onJammyETouchWired = (touches) => {
      this.handleTouches(touches)
    }

    jammy.onDebugMidiResponse = (response) => {
      this.setState({
        response: response,
      })
    }

    jammy
      .requestJammyETouches(
        this.props.left,
        () => {
          return this.launched
        },
        () => {
          this.setState({
            requests: this.requests++,
          })
        }
      )
      .then(() => {
        // Finish
      })
  }

  componentWillUnmount() {
    this.launched = false
    jammy.debugTouches = false
  }

  addActive(to, value) {
    var result = to.slice()
    const availableFret = result.findIndex((element) => element === value)
    if (availableFret >= 0) {
      // ignore
    } else {
      result.push(value)
    }
    return result
  }

  async startTest() {
    this.props.onTestResult(true)
  }

  render() {
    return (
      <Col className="test">
        <Row>{'Out:   ' + this.state.requests}</Row>
        <Row>
          {'In:  ' + this.state.responses + ' - ' + this.state.response}
        </Row>
        <Row className="test-cont test-lb justify-content-md-center">
          <Row className="frets justify-content-md-center">
            <Col className="slb mrg-t-10">
              <Row>1</Row>
              <Row>2</Row>
              <Row>3</Row>
              <Row>4</Row>
              <Row>5</Row>
              <Row>6</Row>
            </Col>
            <OneFret active={this.state.active} />
            <Col className="slb mrg-t-10">
              <Row>({[this.state.touches[0]]})</Row>
              <Row>({[this.state.touches[1]]})</Row>
              <Row>({[this.state.touches[2]]})</Row>
              <Row>({[this.state.touches[3]]})</Row>
              <Row>({[this.state.touches[4]]})</Row>
              <Row>({[this.state.touches[5]]})</Row>
            </Col>
          </Row>
        </Row>
        <Row className="test-st justify-content-md-center">
          <ProgressIndicator />
        </Row>
      </Col>
    )
  }
}

export default TouchTest
