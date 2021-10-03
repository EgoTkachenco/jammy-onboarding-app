import React from 'react'
import { Col, Row } from 'reactstrap'
import ProgressIndicator from '../widget/ProgressIndicator'

import jammy from '../../../services/jammy'

// import './Test.css'
import OneFret from '../widget/OneFret'

const MINIMUM_VELOCITY = 20

class StrummingTest extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      active: [],
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

  handleNotes = (string, velocity) => {
    if (velocity >= MINIMUM_VELOCITY) {
      if (this.strummed.find((e) => e === string) === undefined) {
        this.strummed.push(string)
      }
    }
    this.setState({
      active: this.strummed,
    })

    if (this.strummed.length === 6) {
      this.strummed = []
      this.props.onTestResult !== undefined && this.props.onTestResult(true)
    }
  }

  componentDidMount() {
    this.strummed = []
    // Handle touch for right part
    jammy.onJammyEStringWired = (string, note, velocity) => {
      // console.log("String: ", string, ", note: ", note, ", velocity: ", velocity);
      this.handleNotes(string, velocity)
    }
    jammy.registerJammyEMessages()
  }

  componentWillUnmount() {
    jammy.unregisterJammyEMessages()
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
          </Row>
        </Row>
        <Row className="test-st justify-content-md-center">
          <ProgressIndicator />
        </Row>
      </Col>
    )
  }
}

export default StrummingTest
