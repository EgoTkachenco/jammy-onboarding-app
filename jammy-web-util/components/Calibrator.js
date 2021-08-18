import React, { Component, useCallback, useState } from 'react'
import { useLocalStore, Observer, useObserver } from 'mobx-react'

import { midiService, jammy } from '../../store'
import { JAMMY_E, JAMMY_G } from '../services/jammy'
import midi from '../services/midi'

const UPDATE_TIMER_MS = 15

const strings = Array.from({ length: 6 }, (_, i) => i + 1)
const STRINGNAMES = [
  'String 1 (high E)',
  'String 2 (B)',
  'String 3 (G)',
  'String 4 (D)',
  'String 5 (A)',
  'String 6 (low E)',
]
function getPercent(value, maxValue) {
  return Number((value / maxValue) * 100).toFixed(0)
}

function createStore() {
  const store = {
    strings: [],
    oscs: [0, 0, 0, 0, 0, 0],
    capo: 0,

    findSensor(string, part, axis) {
      return this.strings[string].sensors.find(
        (s) => s.part === part && s.axis === axis
      )
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

      if (value || value === 0) s.value = value
      if (brightness || brightness === 0) s.brightness = brightness
      if (manualBrightness || manualBrightness === 0)
        s.manualBrightness = manualBrightness
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
          maxValue:
            part === 'left' ? 4096 : jammy.api === JAMMY_G ? 1024 : 4096,
          brightness: 0,
          maxBrightness: 255,
          manualBrightness: 90,
        })
      }
    }
  }

  return store
}

const GaugeSensor = ({ string, part, axis, store }) => {
  const sensor = store.findSensor(string, part, axis)

  return useObserver(() => (
    <div className="gause-sensor">
      {/* <div>
        {jammy.api === JAMMY_G ? String(axis).toUpperCase() : ''} {part}{' '}
        {part === 'right' ? 'OSC:' + store.oscs[string] : ''}
      </div> */}
      <div className="gause-sensor__value">
        {String(axis).toUpperCase()}={sensor.value}
      </div>
      <div className="gause-sensor-visualize">
        <div
          className="gause-sensor-visualize__value"
          style={{
            minHeight: '0px',
            height: getPercent(sensor.value, sensor.maxValue) + '%',
          }}
        />
      </div>
    </div>
  ))
}

const SensorManualContro = ({ manualEnabled, string, axis, part, store }) => {
  const [loading, setloading] = useState(false)
  const setAutoLedBrightness = useCallback(() => {
    setloading(true)
    store.__setLedBrightness(string, part, 'x', -1)
    store.__setLedBrightness(string, part, 'y', -1)
    setTimeout(() => {
      setloading(false)
    }, 6000)
  }, [string, part, store])

  if (manualEnabled) {
    if (!loading) {
      return (
        <div className="sensor-auto__btn" onClick={setAutoLedBrightness}>
          Auto
        </div>
      )
    } else {
      return (
        <div className="sensor-auto__btn loading">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <mask id="path-1-inside-1" fill="white">
              <path d="M12 0C9.05001 -3.51783e-08 6.20338 1.08663 4.00376 3.05237C1.80414 5.01811 0.405667 7.7252 0.0754282 10.6567C-0.254811 13.5881 0.506322 16.5385 2.21347 18.9443C3.92061 21.3502 6.45413 23.0429 9.33019 23.6992C12.2062 24.3556 15.2233 23.9295 17.8051 22.5024C20.387 21.0753 22.3527 18.7472 23.3268 15.9627C24.301 13.1782 24.2153 10.1324 23.0863 7.40707C21.9572 4.6817 19.8637 2.46774 17.2058 1.18798L16.3103 3.04785C18.511 4.10746 20.2443 5.94059 21.1792 8.19714C22.1141 10.4537 22.185 12.9755 21.3784 15.281C20.5718 17.5866 18.9442 19.5142 16.8065 20.6958C14.6688 21.8774 12.1708 22.2302 9.78945 21.6868C7.40813 21.1433 5.31041 19.7418 3.89693 17.7498C2.48345 15.7578 1.85324 13.3149 2.12667 10.8877C2.40011 8.46054 3.55801 6.21912 5.37926 4.59153C7.2005 2.96393 9.55746 2.06422 12 2.06422V0Z" />
            </mask>
            <path
              d="M12 0C9.05001 -3.51783e-08 6.20338 1.08663 4.00376 3.05237C1.80414 5.01811 0.405667 7.7252 0.0754282 10.6567C-0.254811 13.5881 0.506322 16.5385 2.21347 18.9443C3.92061 21.3502 6.45413 23.0429 9.33019 23.6992C12.2062 24.3556 15.2233 23.9295 17.8051 22.5024C20.387 21.0753 22.3527 18.7472 23.3268 15.9627C24.301 13.1782 24.2153 10.1324 23.0863 7.40707C21.9572 4.6817 19.8637 2.46774 17.2058 1.18798L16.3103 3.04785C18.511 4.10746 20.2443 5.94059 21.1792 8.19714C22.1141 10.4537 22.185 12.9755 21.3784 15.281C20.5718 17.5866 18.9442 19.5142 16.8065 20.6958C14.6688 21.8774 12.1708 22.2302 9.78945 21.6868C7.40813 21.1433 5.31041 19.7418 3.89693 17.7498C2.48345 15.7578 1.85324 13.3149 2.12667 10.8877C2.40011 8.46054 3.55801 6.21912 5.37926 4.59153C7.2005 2.96393 9.55746 2.06422 12 2.06422V0Z"
              stroke="white"
              strokeWidth="12"
              mask="url(#path-1-inside-1)"
            />
          </svg>
        </div>
      )
    }
  } else {
    return <div />
  }
}

const GaugeSensors = ({ string, part, store, config }) => {
  return (
    <div className="sensor-container">
      <div className="sensor-container__title">{STRINGNAMES[string]}</div>
      <div className="sensor-container-sensors">
        <GaugeSensor string={string} part={part} axis="x" store={store} />
        <GaugeSensor string={string} part={part} axis="y" store={store} />
      </div>
      <SensorManualContro
        manualEnabled={config.isManual}
        string={string}
        part={part}
        store={store}
      />
    </div>
  )
}

class CalibrationDashboard extends Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.onlyX = false
    this.updateTimer = null
    this.leftSerialReceivedCount = 0
    this.tuningSent = false
    this.nextStringIdx = 0
    this.britnessUpdatedCounter = 0
  }

  componentDidMount() {
    midiService.init().finally(() => {
      midiService.loadState()
      midiService.addEventListener('midimessage', this.onMidiMessage)
      this.updateTimer = window.setInterval(() => {
        if (jammy.api === JAMMY_G) {
          this.sendNextStringDiagRequestForG()
        } else if (jammy.api === JAMMY_E) {
          this.sendNextStringDiagRequestForE()
        }
      }, UPDATE_TIMER_MS)
    })
  }

  componentWillUnmount() {
    clearInterval(this.updateTimer)
    midiService.removeEventListener('midimessage', this.onMidiMessage)
  }

  sendNextStringDiagRequestForG() {
    jammy.sendDiagnosticRequestForG(this.nextStringIdx)
    jammy.sendFretRequestForG(this.nextStringIdx)
    jammy.sendCapoRequestForG()

    this.nextStringIdx++
    if (this.nextStringIdx === strings.length) {
      this.nextStringIdx = 0
    }
  }

  sendNextStringDiagRequestForE() {
    if (this.britnessUpdatedCounter % 6 === 0) {
      this.requestDiagnosticsForE()
    }
    this.requestStringDataForE()
  }

  parseStringDiagDataFromG = (data) => {
    var ss = {}
    ss.stringIdx = data[0] - 1
    ss.xlBrightness = data[1]

    let tmp = data[2]
    tmp = (tmp << 8) | data[3]
    ss.xlADC = tmp
    ss.ylBrightness = data[4]

    tmp = data[5]
    tmp = (tmp << 8) | data[6]
    ss.ylADC = tmp

    ss.lMidiCh = data[7] & 0x0f

    if ((data[7] & 0x10) === 0x10) ss.isLXCalibrDone = true
    else ss.isLXCalibrDone = false

    if ((data[7] & 0x20) === 0x20) ss.isLYCalibrDone = true
    else ss.isLYCalibrDone = false

    ss.xrBrightness = data[8]
    tmp = data[9]
    tmp = (tmp << 8) | data[10]
    ss.xrADC = tmp
    ss.yrBrightness = data[11]
    tmp = data[12]
    tmp = (tmp << 8) | data[13]
    ss.yrADC = tmp
    ss.rMidiCh = data[14]
    ss.rTuning = data[15]

    if ((data[16] & 0x01) === 0x01) ss.isLeftTouch = true
    else ss.isLeftTouch = false

    if ((data[16] & 0x02) === 0x02) ss.isRightTouch = true
    else ss.isRightTouch = false

    if ((data[16] & 0x04) === 0x04) ss.isRXCalibrDone = true
    else ss.isRXCalibrDone = false

    if ((data[16] & 0x08) === 0x08) ss.isRYCalibrDone = true
    else ss.isRYCalibrDone = false

    if (ss.isLeftTouch && ss.isRightTouch) ss.NowTouchState = 'isBothTouched'
    if (ss.isLeftTouch && !ss.isRightTouch) ss.NowTouchState = 'isLeftTouched'
    if (!ss.isLeftTouch && ss.isRightTouch) ss.NowTouchState = 'isRightTouched'
    if (!ss.isLeftTouch && !ss.isRightTouch) ss.NowTouchState = 'Default'

    return ss
  }

  onStringDiagReceived = (data) => {
    const ss = this.parseStringDiagDataFromG(data)
    // console.log("data", ss);

    const store = this.props.store

    store.updateStringTouch(ss.stringIdx, ss.NowTouchState)

    store.updateSensor(ss.stringIdx, 'left', 'x', {
      value: ss.xlADC,
      brightness: ss.xlBrightness,
    })
    store.updateSensor(ss.stringIdx, 'left', 'y', {
      value: ss.ylADC,
      brightness: ss.ylBrightness,
    })
    store.updateSensor(ss.stringIdx, 'right', 'x', {
      value: ss.xrADC,
      brightness: ss.xrBrightness,
    })
    store.updateSensor(ss.stringIdx, 'right', 'y', {
      value: ss.yrADC,
      brightness: ss.yrBrightness,
    })
  }

  parseParamResponse = (jammyData, offset) => {
    const stringId = jammyData[1 + offset]
    if (stringId !== 0x7e && stringId !== 0x7f) {
      if (stringId > 6) {
        console.warn('Invalid string number: ', stringId, 'data: ', jammyData)
        return
      }
      let group = jammyData[2 + offset]
      let param = jammyData[3 + offset]
      let value = (jammyData[4 + offset] << 8) + jammyData[5 + offset]
      // console.log(`String: ${stringId}, grouop: ${group}, param: ${param}, value: ${value}`)
      if (group === 7 && param === 0) {
        this.props.store.strings[stringId].fret = value
      } else if (stringId === 6 && group === 0 && param === 4) {
        this.props.store.capo = value
      }
    } else {
      // console.log(`Invalid request: ${stringId}`);
    }
  }

  onMidiMessage = (event) => {
    // console.log('ev', event);

    if (jammy.api === JAMMY_G) {
      this.tryUnpackEventFromG(event)
    } else if (jammy.api === JAMMY_E) {
      this.tryUnpackEventFromE(event)
    }
    // if (event.data.length === 9) {
    //   this.parseTraceEvent(event.data);
    // }
  }

  tryUnpackEventFromG = (event) => {
    if (event.data.length === 39) {
      if (event.data[5] === 0) {
        // Left part serial
        if (!this.tuningSent) {
          console.log(this.tuningSent, this.leftSerialReceivedCount)
          this.leftSerialReceivedCount++
          if (this.leftSerialReceivedCount > 10) {
            this.leftSerialReceivedCount = 0
            jammy.sendStandardTuning()
            this.tuningSent = true
          }
        }
      }
      const jammyData = jammy.unpackJammySysexForG(event.data)
      if (jammyData.length > 0) {
        switch (jammyData[0]) {
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
          case 6:
            this.onStringDiagReceived(jammyData)
            break

          case 7:
            // Diagnostics on start
            if (jammyData[7] === 0xf) {
              // Last part - we need to stop advertising by querying anything
              jammy.sendVersionsRequest()
            }
            break

          case 8:
            // Versions info
            console.log(
              `Versions - LEFT HW1: ${jammyData[1]}; LEFT HW2: ${jammyData[2]}; LEFT FW: ${jammyData[3]}; RIGHT FW: ${jammyData[8]};`
            )
            break
          case 9:
            // Right part info
            this.parseParamResponse(jammyData, 7)
            break
          case 10:
            // Left part info
            this.parseParamResponse(jammyData, 0)
            break
          default:
            break
        }
      }
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
      const store = this.props.store

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
        // console.log("Strings values: ", data)
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
      } /*if (type === 0x18 && part === 0x0D && size === 12)*/ else {
        // console.log("OSC values: ", data)
        // F0 00 02 27 00 18 0D 03 0C 0C 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 5A 5A 01 01 F7
        this.onDataUpdate(10, false, (string, value) => {
          store.oscs[string] = value
        })
      }
    } else if (data.length === PARAMS_DATA_SIZE) {
      let stringId = data[6]
      let groupId = data[7]
      let paramId = data[8]
      let value = midi.to16BitInt(data, 9)

      const store = this.props.store

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

  requestStringDataForE = async () => {
    if (this.britnessUpdatedCounter % 3 === 0) {
      jammy.sendParamRequest('get', {
        groupId: 7,
        paramId: 1,
        stringId: this.nextStringIdx,
        left: true,
        value: 0,
      })
    }

    if (this.britnessUpdatedCounter % 7 === 0) {
      jammy.sendParamRequest('get', {
        groupId: 11,
        paramId: 0,
        stringId: this.nextStringIdx,
        left: false,
        value: 0,
      })
    }

    if (this.britnessUpdatedCounter % 13 === 0) {
      jammy.sendParamRequest('get', {
        groupId: 11,
        paramId: 1,
        stringId: this.nextStringIdx,
        left: true,
        value: 0,
      })
    }
    this.nextStringIdx++
    if (this.nextStringIdx === strings.length) {
      this.britnessUpdatedCounter++
      this.nextStringIdx = 0
    }
  }

  requestDiagnosticsForE() {
    if (!jammy.requestData) {
      jammy.requestData = [
        [true, 'GET', 0, 3],
        //       [true, "GET", 1], // Left: Flashes
        //       [true, "GET", 2], // Left: Accelerometer
        [false, 'GET', 0, 3],
        [false, 'GET', 13],
      ]
    }

    if (!jammy.eDiagnosIndex) {
      jammy.eDiagnosIndex = 0
    }

    let data = jammy.requestData[jammy.eDiagnosIndex]
    jammy.sendDiagnosticRequestForE(data[0], data[1], data[2])

    if (jammy.eDiagnosIndex++ >= jammy.requestData.length - 1) {
      jammy.eDiagnosIndex = 0
    }
  }

  render() {
    const store = this.props.store
    const onlyX = this.props.onlyX

    store.__setLedBrightness = function (string, part, axis, brightness) {
      // console.log("slb", arguments);
      jammy.sendLedBrightness(string, part, axis, brightness)
    }
    return (
      <div className="calibrator">
        {this.props.config.showLeftPart && (
          <>
            <div className="calibrator-label-card">
              Sensors on the left-hand (fretboard/neck) side of your Jammy:
            </div>
            <div className="calibrator-strings-line">
              {strings.map((_, string) => (
                <Observer key={string}>
                  {() => {
                    const isActive = [
                      'isLeftTouched',
                      'isBothTouched',
                    ].includes(store.strings[string].nowTouchState)
                    return (
                      <div className={`${isActive ? 'active' : ''}`}>
                        <GaugeSensors
                          string={string}
                          part="left"
                          store={store}
                          config={this.props.config}
                        />
                      </div>
                    )
                  }}
                </Observer>
              ))}
            </div>
          </>
        )}

        <div className="calibrator-label-card">
          Sensors on the right-hand (body/bridge) side:
        </div>
        <div className="calibrator-strings-line">
          {strings.map((_, string) => (
            <Observer key={string}>
              {() => {
                const isActive = ['isRightTouched', 'isBothTouched'].includes(
                  store.strings[string].nowTouchState
                )
                return (
                  <div className={`${isActive ? 'active' : ''}`}>
                    <GaugeSensors
                      string={string}
                      part="right"
                      store={store}
                      config={this.props.config}
                    />
                  </div>
                )
              }}
            </Observer>
          ))}
        </div>
      </div>
    )
  }
}

const CalibrationG = ({ config }) => {
  midiService.logIncoming = false
  midiService.logOutgoing = false
  midiService.manualSensorsControl = false
  jammy.api = JAMMY_G

  const store = useLocalStore(createStore)

  return (
    <div className="flex-1 d-flex flex-column">
      <CalibrationDashboard store={store} onlyX={false} config={config} />
    </div>
  )
}

const CalibrationE = ({ config }) => {
  midiService.logIncoming = false
  midiService.logOutgoing = false
  midiService.manualSensorsControl = false
  jammy.api = JAMMY_E

  const store = useLocalStore(createStore)

  return <CalibrationDashboard store={store} onlyX={true} config={config} />
}

export { CalibrationE, CalibrationG }
