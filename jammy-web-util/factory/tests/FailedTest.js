import React, { Component } from 'react'
import { Col, Row } from 'reactstrap'
import TestResult from '../widget/TestResult'

// import './Test.css'

class FailedTest extends Component {
  render() {
    return (
      <Col className="test">
        <Row className="test-cont test-lb justify-content-md-center">
          Test {this.props.test} for {this.props.part}
        </Row>
        <Row className="test-st justify-content-md-center">
          <TestResult passed="false" />
        </Row>
      </Col>
    )
  }
}

export default FailedTest
