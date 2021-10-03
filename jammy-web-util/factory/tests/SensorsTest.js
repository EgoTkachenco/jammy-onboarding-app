import React from 'react'
import { Col, Row } from 'reactstrap'
import jammy from '../../../services/jammy'
import midi from '../../../services/midi'
import { sleep } from '../../../services/utils'
import ProgressIndicator from '../widget/ProgressIndicator'
import Sensors from '../widget/Sensors'

// import './Test.css'

const UPDATE_TIMER_MS = 100 // ms
const OPEN_COEFFICIENT = 500 // Sensor value for open sensors >= (Sensor.max - OPEN_COEFFICIENT)
const CLOSE_COEFFICIENT = 500 // Sensor value for close sensors <= CLOSE_COEFFICIENT
const REPEAT_COUNT = 50 // 30 seconds max for open and close tests
const REPEAT_COUNT_SHORT = 30 // 10 seconds max for open and close tests
const REPEAT_COUNT_INFINITE = 100000 // 100_000 secons

const strings = Array.from({ length: 6 }, (_, i) => i + 1)

function createStore() {
  const store = {
    strings: [],
    oscs: [0, 0, 0, 0, 0, 0],
    capo: 0,

    findSensor(string, part, axis) {
      const str = this.strings[string]
      return str === undefined
        ? undefined
        : str.sensors.find((s) => s.part === part && s.axis === axis)
    },

    updateStringTouch(string, nowTouchState) {
      this.strings[string].nowTouchState = nowTouchState
    },

    updateSensor(
      string,
      part,
      axis,
      { value, brightness, manualBrightness } = {}
    ) {
      const s = this.findSensor(string, part, axis)

      if (s !== undefined) {
        if (value || value === 0) s.value = value
        if (brightness || brightness === 0) s.brightness = brightness
        if (manualBrightness || manualBrightness === 0)
          s.manualBrightness = manualBrightness
      }
    },
  }

  for (let i in strings) {
    const s = { fret: 0, nowTouchState: 'Default', sensors: [] }
    store.strings.push(s)

    for (let part of ['left', 'right']) {
      for (let axis of ['x', 'y']) {
        s.sensors.push({
          string: i,
          stringName: String(i + 1),
          part,
          axis,
          value: 0,
          maxValue: 4096,
          brightness: 0,
          maxBrightness: 255,
          manualBrightness: 90,
        })
      }
    }
  }

  return store
}

export class SensorsTest extends React.Component {
  constructor(props) {
    super(props)
    this.brightnessUpdatedCounter = 0
    this.nextStringIdx = 0
    this.store = createStore()
    this.state = {
      sensors: [],
    }
    this.startTest.bind(this.startTest)
  }

  updateState = () => {
    this.setState({
      sensors: this.store.strings.map((e, i) => {
        const data = e.sensors[this.props.left === true ? 0 : 2]
        return {
          string: i,
          max: data.maxValue,
          value: data.value,
          brightness: data.brightness,
        }
      }),
    })
  }

  testPassed() {
    if (this.running === true) {
      this.props.onTestResult !== undefined && this.props.onTestResult(true)
    }
  }

  testFailed() {
    if (this.running === true) {
      this.props.onTestResult !== undefined && this.props.onTestResult(false)
    }
  }

  checkShortTest() {
    var validCounter = 0
    for (var i = 0; i < 6; i++) {
      const str = this.state.sensors[i]
      if (str !== undefined && str.value > 0 && str.brightness > 0) {
        validCounter++
      }
    }

    console.log(
      'Short test checked with: ',
      validCounter,
      ' valid sensors: ',
      this.state.sensors
    )

    if (validCounter === 6) {
      this.testPassed()
      return true
    } else {
      return false
    }
  }

  checkOpenTest() {
    var validCounter = 0
    for (var i = 0; i < 6; i++) {
      const str = this.state.sensors[i]
      if (str !== undefined && str.value >= str.max - OPEN_COEFFICIENT) {
        validCounter++
      }
    }

    console.log(
      'Open test checked with: ',
      validCounter,
      ' valid sensors: ',
      this.state.sensors
    )

    if (validCounter === 6) {
      this.testPassed()
      return true
    } else {
      return false
    }
  }

  checkCloseTest() {
    var validCounter = 0
    for (var i = 0; i < 6; i++) {
      const str = this.state.sensors[i]
      if (str !== undefined && str.value <= CLOSE_COEFFICIENT) {
        validCounter++
      }
    }
    console.log(
      'Close test checked with: ',
      validCounter,
      ' valid sensors: ',
      this.state.sensors
    )
    if (validCounter === 6) {
      this.testPassed()
      return true
    } else {
      return false
    }
  }

  tryUnpackEventFromE = (event) => {
    let data = event.data
    const DIAGNOSTIC_DATA_SIZE = 35
    const PARAMS_DATA_SIZE = 14
    if (data.length === DIAGNOSTIC_DATA_SIZE) {
      let part = data[5]
      let type = data[6]
      let size = midi.to14BitInt(data, 8)
      const store = this.store

      this.onDataUpdate = (start, full, onData) => {
        let values = [0, 0, 0, 0, 0, 0]
        for (
          let i = start, j = 0;
          i < DIAGNOSTIC_DATA_SIZE && j < 6;
          i += 4, j++
        ) {
          let value = full ? midi.to16BitInt(data, i) : midi.to14BitInt(data, i)
          values[j] = value
          onData(j, value)
        }
        this.updateState()
        // console.log("Strings values: ", this.store.strings)
      }

      if (type === 0x00 && part === 0x18 && size === 12) {
        this.onDataUpdate(12, true, (string, value) => {
          store.updateSensor(string, 'right', 'x', {
            value: value | 0,
          })
        })
      } else if (type === 0x00 && part === 0x19 && size === 12) {
        this.onDataUpdate(12, true, (string, value) => {
          store.updateSensor(string, 'left', 'x', {
            value: value | 0,
          })
        })
      } else {
        this.onDataUpdate(10, false, (string, value) => {
          store.oscs[string] = value
        })
      }
    } else if (data.length === PARAMS_DATA_SIZE) {
      let stringId = data[6]
      let groupId = data[7]
      let paramId = data[8]
      let value = midi.to16BitInt(data, 9)

      const store = this.store

      if (groupId === 7 && paramId === 1) {
        store.strings[stringId].fret = value
      } else if (groupId === 11 && paramId === 0) {
        store.updateSensor(stringId, 'right', 'x', {
          brightness: value,
        })
      } else if (groupId === 11 && paramId === 1) {
        store.updateSensor(stringId, 'left', 'x', {
          brightness: value,
        })
      }
    }
  }

  sendNextStringDiagRequestForE() {
    if (this.brightnessUpdatedCounter % 6 === 0) {
      this.requestDiagnosticsForE()
    }
    this.requestStringDataForE(this.props.left === true)
  }

  requestDiagnosticsForE() {
    if (!jammy.requestData) {
      jammy.requestData = [this.props.left, 'GET', 0, 3]
    }

    let data = jammy.requestData
    jammy.sendDiagnosticRequestForE(data[0], data[1], data[2])
  }

  requestStringDataForE = async (isLeft) => {
    if (this.brightnessUpdatedCounter % 7 === 0) {
      jammy.sendParamRequest('get', {
        groupId: 7,
        paramId: 1,
        stringId: this.nextStringIdx,
        left: true,
        value: 0,
      })
    }

    // console.log("Request string data for left: ", isLeft, " counter: ", this.brightnessUpdatedCounter)

    if (!isLeft) {
      if (this.brightnessUpdatedCounter % 3 === 0) {
        jammy.sendParamRequest('set', {
          groupId: 11,
          paramId: 0,
          stringId: this.nextStringIdx,
          left: false,
          value: 127,
        })
      }

      if (this.brightnessUpdatedCounter % 5 === 0) {
        jammy.sendParamRequest('get', {
          groupId: 11,
          paramId: 0,
          stringId: this.nextStringIdx,
          left: false,
          value: 0,
        })
      }
    }

    if (isLeft) {
      if (this.brightnessUpdatedCounter % 3 === 0) {
        jammy.sendParamRequest('set', {
          groupId: 11,
          paramId: 1,
          stringId: this.nextStringIdx,
          left: true,
          value: 127,
        })
      }
      if (this.brightnessUpdatedCounter % 5 === 0) {
        jammy.sendParamRequest('get', {
          groupId: 11,
          paramId: 1,
          stringId: this.nextStringIdx,
          left: true,
          value: 0,
        })
      }
    }

    this.nextStringIdx++
    if (this.nextStringIdx >= strings.length) {
      this.brightnessUpdatedCounter++
      this.nextStringIdx = 0
    }
  }

  async startTest() {
    console.log('Start test: ', this.props)
    var i = 0
    var result = false
    let repeatCount =
      this.props.infinite === true
        ? REPEAT_COUNT_INFINITE
        : this.props.short === true
        ? REPEAT_COUNT_SHORT
        : REPEAT_COUNT
    while (i++ < repeatCount && this.running === true) {
      await sleep(1000)
      if (this.props.short === true) {
        if (this.checkShortTest()) {
          result = true
          break
        }
      } else if (this.props.open === true) {
        if (this.checkOpenTest()) {
          result = true
          break
        }
      } else if (this.props.open === false) {
        if (this.checkCloseTest()) {
          result = true
          break
        }
      }
    }
    if (result === false && this.props.short === true && i >= repeatCount) {
      this.testPassed()
    } else if (result === false) {
      this.testFailed()
    }
  }

  componentDidMount() {
    // midi.logOutgoing = true;
    // midi.logIncoming = true;
    this.running = true
    midi.addEventListener('midimessage', this.tryUnpackEventFromE)
    this.updateTimer = window.setInterval(() => {
      if (this.running === true) {
        this.sendNextStringDiagRequestForE()
      }
    }, UPDATE_TIMER_MS)

    this.startTest().then(() => {
      // Finish
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
        <Row className="test-cont test-lb">
          <Sensors sensors={this.state.sensors} />
        </Row>
        <Row className="test-st justify-content-md-center">
          <ProgressIndicator />
        </Row>
      </Col>
    )
  }
}

export default SensorsTest
