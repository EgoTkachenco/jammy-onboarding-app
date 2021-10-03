import React from 'react'
import { Col, Row } from 'reactstrap'
import ProgressIndicator from '../widget/ProgressIndicator'

import jammy from '../../../services/jammy'

// import './Test.css'
import LeftStrings from '../widget/LeftStrings'
import { sleep } from '../../../services/utils'

const POINTS = 90

class LeftStringsTest extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      frets: [],
    }
    this.startTest.bind(this.startTest)
    this.addActive.bind(this.addActive)
  }

  componentDidMount() {
    this.launched = true
    jammy.onJammyESegmentWired = (string, fret, segment) => {
      this.setState({
        frets: this.addActive(this.state.frets, fret, string),
      })
      let count = this.calculateFrets(this.state.frets)
      if (this.launched === true && count >= POINTS) {
        this.launched = false
        this.props.onTestResult !== undefined && this.props.onTestResult(true)
      }
    }

    jammy
      .requestJammyESegmentWires(() => {
        return this.launched
      }, [0, 1, 2, 3, 4, 5])
      .then(() => {
        // Finish
      })
    this.startTest().then(() => {
      // Started
    })
  }

  componentWillUnmount() {
    this.launched = false
  }

  addActive(to, fret, value) {
    var result = to.slice()
    const availableFret = result.findIndex((element) => element.fret === fret)
    if (availableFret >= 0) {
      // Update
      const newActive = result[availableFret].active.slice()
      if (!newActive.includes(value)) {
        newActive.push(value)
      }
      result[availableFret] = { fret: fret, active: newActive }
    } else {
      result.push({ fret: fret, active: [value] })
    }
    return result
  }

  async startTest() {
    await sleep(1000)
    if (this.calculateFrets(this.state.frets) > 0 && this.launched) {
      this.props.onTestResult(false)
    }
  }

  calculateFrets = (frets) => {
    var res = 0
    for (var i = 0; i < 15; i++) {
      const tested = frets[i]
      if (tested !== undefined) {
        res += tested.active.length
      }
    }
    return res
  }

  render() {
    return (
      <Col className="test">
        <Row className="test-cont test-lb">
          <Col>
            <Row className="frets justify-content-md-center">
              <LeftStrings frets={this.state.frets} />
            </Row>
            <Row className="justify-content-md-center">
              {this.calculateFrets(this.state.frets)} from {POINTS} tested
            </Row>
          </Col>
        </Row>
        <Row className="test-st justify-content-md-center">
          <ProgressIndicator />
        </Row>
      </Col>
    )
  }
}

export default LeftStringsTest
