import React, { Component } from 'react'

// import './TestResult.css'

class TestResult extends Component {
  constructor(props) {
    super(props)
    console.log('Passed: ', props.passed)
  }

  render() {
    let passed = this.props.passed
    console.log('Render passed: ', this.props)
    return (
      <div className="res label">
        <div className={passed === 'true' ? 'pass' : 'fail'}>
          {passed === 'true' ? 'PASSED' : 'FAILED'}
        </div>
      </div>
    )
  }
}

export default TestResult
