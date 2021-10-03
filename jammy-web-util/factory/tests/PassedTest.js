import React, { Component } from 'react'
import { Col, Row } from 'reactstrap'
import TestResult from '../widget/TestResult'

// import './Test.css'

class PassedTest extends Component {
  render() {
    return (
      <Col className="test">
        <Row className="test-cont test-lb justify-content-md-center">
          All tests for {this.props.part}
        </Row>
        <Row className="test-st justify-content-md-center">
          <TestResult passed="true" />
        </Row>
      </Col>
    )
  }
}

export default PassedTest
