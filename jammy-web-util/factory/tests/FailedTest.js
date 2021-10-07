import React, { Component } from 'react'
import { Col, Row } from 'reactstrap'

// import './Test.css'

class FailedTest extends Component {
  render() {
    return (
      <Col className="test">
        <Row className="test-cont test-lb justify-content-md-center">
          Failed {this.props.test}
        </Row>
      </Col>
    )
  }
}

export default FailedTest
