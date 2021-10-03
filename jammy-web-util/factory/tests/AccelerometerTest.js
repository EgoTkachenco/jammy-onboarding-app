import React from 'react'
import { Col, Row } from 'reactstrap'
import jammy from '../../../services/jammy'
import midi from '../../../services/midi'
import { sleep } from '../../../services/utils'
import ProgressIndicator from '../widget/ProgressIndicator'

// import './Test.css'

const UPDATE_TIMER_MS = 500 // Requests period

class AccelerometerTest extends React.Component {
  createAngles = (x, y, z) => {
    return {
      x: x,
      y: y,
      z: z,
    }
  }

  constructor(props) {
    super(props)
    this.angles = this.createAngles(0.0, 0.0, 0.0)
    this.startTest.bind(this.startTest)
  }

  async startTest() {
    await sleep(1000)
    let a = this.angles
    let firstAngles = this.createAngles(a.x, a.y, a.z)
    await sleep(2000)
    let b = this.angles
    let secondAngles = this.createAngles(b.x, b.y, b.z)

    console.log('First: ', firstAngles, ', second: ', secondAngles)

    this.props.onTestResult(
      firstAngles.x !== secondAngles.x &&
        firstAngles.y !== secondAngles.y &&
        firstAngles.z !== secondAngles.z
    )
  }

  requestDiagnosticsForE() {
    jammy.sendDiagnosticRequestForE(false, 'GET', 2)
  }

  onAccelerometerChanged = (x, y, z) => {
    // Implement fo listen updates
    this.angles = this.createAngles(x, y, z)
  }

  tryUnpackEventFromE = (event) => {
    let data = event.data
    const DIAGNOSTIC_DATA_SIZE = 35
    if (data.length === DIAGNOSTIC_DATA_SIZE) {
      let part = data[5]
      let type = data[6]
      let size = midi.to14BitInt(data, 8)

      if (type === 0x02 && part === 24 && size === 12) {
        const x = midi.toFloat32(data, 10)
        const y = midi.toFloat32(data, 18)
        const z = midi.toFloat32(data, 26)
        this.onAccelerometerChanged(x, y, z)

        console.log(
          'Part: ',
          part,
          ', type: ',
          type,
          ', size: ',
          size,
          ', x = ',
          x,
          ', y = ',
          y,
          ', z = ',
          z
        )
      }
    }
  }

  componentDidMount() {
    // midi.logOutgoing = true;
    // midi.logIncoming = true;
    this.running = true
    midi.addEventListener('midimessage', this.tryUnpackEventFromE)
    this.updateTimer = window.setInterval(() => {
      this.requestDiagnosticsForE()
    }, UPDATE_TIMER_MS)

    this.startTest().then({
      // Test finished
    })
  }

  componentWillUnmount() {
    this.running = false
    clearInterval(this.updateTimer)
    midi.removeEventListener('midimessage', this.tryUnpackEventFromE)
  }

  render() {
    return (
      <Col className="test">
        <Row className="test-cont test-lb justify-content-md-center">
          Accelerometer testing...
        </Row>
        <Row className="test-st justify-content-md-center">
          <ProgressIndicator />
        </Row>
      </Col>
    )
  }
}

export default AccelerometerTest
