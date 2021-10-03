import React from 'react'
import { Col, Row } from 'reactstrap'
import Frets from '../widget/Frets'
import ProgressIndicator from '../widget/ProgressIndicator'

import jammy from '../../../services/jammy'

// import './Test.css'

class FretsTest extends React.Component {
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
        frets: this.addActive(this.state.frets, fret, segment),
      })
      let count = this.calculateFrets(this.state.frets)
      if (this.launched === true && count >= 165) {
        this.launched = false
        this.props.onTestResult !== undefined && this.props.onTestResult(true)
      }
    }

    jammy
      .requestJammyESegmentWires(() => {
        return this.launched
      })
      .then(() => {
        // Finish
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
    this.props.onTestResult(true)
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
              <Frets frets={this.state.frets} />
            </Row>
            <Row className="justify-content-md-center">
              {this.calculateFrets(this.state.frets)} from 165 tested
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

export default FretsTest
