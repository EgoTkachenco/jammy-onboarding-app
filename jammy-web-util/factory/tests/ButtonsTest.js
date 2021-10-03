import React from 'react'
import { Col, Row } from 'reactstrap'
import midi from '../../../services/midi'
import ProgressIndicator from '../widget/ProgressIndicator'

// import './Test.css'

class ButtonsTest extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      btn1: false,
      btn2: false,
    }
  }

  async startTest() {
    this.props.onTestResult(true)
  }

  checkTest = () => {
    if (this.state.btn1 === true && this.state.btn2 === true) {
      this.props.onTestResult !== undefined && this.props.onTestResult(true)
    }
  }

  midiMessageCallback = (event) => {
    console.log('Event: ', event.data)
    let data = event.data
    if (data[0] === 0xb1 && data[1] === 0x05) {
      if (this.buttonValue < data[2]) {
        this.setState({
          btn1: true,
        })
      } else if (this.buttonValue > data[2]) {
        this.setState({
          btn2: true,
        })
      }
      this.buttonValue = data[2]
    }
    this.checkTest()
  }

  componentDidMount() {
    midi.removeEventListener('midimessage', this.midiMessageCallback)
    midi.addEventListener('midimessage', this.midiMessageCallback)
  }

  componentWillUnmount() {
    midi.removeEventListener('midimessage', this.midiMessageCallback)
  }

  render() {
    return (
      <Col className="test">
        <Row className="test-cont test-lb justify-content-md-center">
          <Col className="btns justify-content-md-center">
            <Row
              className={
                'stat rect ' +
                (this.state.btn1 === true ? 'enbl' : 'dis') +
                ' justify-content-md-center'
              }
            >
              Push Button 1{' '}
            </Row>
            <Row
              className={
                'stat rect ' +
                (this.state.btn2 === true ? 'enbl' : 'dis') +
                ' justify-content-md-center'
              }
            >
              Push Button 2{' '}
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

export default ButtonsTest
