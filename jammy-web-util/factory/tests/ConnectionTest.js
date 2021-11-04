import React from 'react'
import { jammy, midiService as midi } from '../../../store'
import { sleep } from '../../services/utils'
import { Loader } from '../../../components/Loader'

class ConnectionTest extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      rfw: undefined,
      lfw: undefined,
    }

    this.startTest.bind(this.startTest)
  }

  connected = false

  isMidiConnected = () =>
    midi.activeInputs.length > 0 && midi.activeOutputs.length > 0

  isLeftIsConnected = () => this.state.lfw !== undefined && this.state.lfw >= 0

  isRightIsConnected = () => this.state.rfw !== undefined && this.state.rfw >= 0

  getFirmwareVersions = () => {
    console.log('getFirmwareVersions for left = ', this.props.left)
    jammy.sendVersionsRequest()
  }

  componentDidMount() {
    this.running = true
    if (!midi.hasAccess()) {
      console.log('Init test for left = ', this.props.left)
      midi.init().finally(() => {
        midi.loadState()
        this.launchTests()
      })
    } else {
      console.log('Reinit test for left = ', this.props.left)
      this.launchTests()
    }
  }

  requestSerialData = async () => {
    jammy.onJammyESerial = (serial) => {
      console.log('New serial: ', serial)
      this.props.onSerial(serial)
    }
    jammy.sendJammyEMetaDataRequest()
  }

  launchTests = () => {
    midi.addEventListener('midimessage', this.onMidiMessage)
    jammy.registerJammyEMetaData()
    // if (this.isMidiConnected() === true && this.props.left !== true) {
    //     this.props.onTestResult !== undefined && this.props.onTestResult(true);
    // } else {

    // }

    this.startTest().then({
      // Test finished
    })
  }

  componentWillUnmount() {
    this.running = false
    jammy.unregisterJammyEMetaData()
    midi.removeEventListener('midimessage', this.onMidiMessage)
  }

  onMidiMessage = (event) => {
    this.parseMidiMessageForE(event)
  }

  updateVersions = () => {
    if (this.props.onVersion !== undefined) {
      this.props.onVersion(
        this.state.lfw ?? 0,
        this.state.lhw ?? 0,
        this.state.rfw ?? 0,
        this.state.rhw ?? 0
      )
    }
  }

  parseMidiMessageForE(event) {
    const jammyData = event.data
    const stringId = jammyData[6]
    if (stringId !== 0x7e && stringId !== 0x7f) {
      const groupId = jammyData[7]
      const paramId = jammyData[8]
      let value = midi.to16BitInt(jammyData, 9)
      if (stringId === 6) {
        switch (groupId) {
          case 3: // FW Versions
            switch (paramId) {
              case 0: // Right part fw
                console.log(`Versions - RIGHT FW: ${value}`)
                this.setState({
                  rfw: value,
                })
                this.updateVersions()
                break
              case 1: // Left part fw
                console.log(`Versions - LEFT FW: ${value}`)
                this.setState({
                  lfw: value,
                })
                this.updateVersions()
                break
              case 2: // Left part hw
                console.log(`Versions - LEFT HW: ${value}`)
                this.setState({
                  lhw: value,
                })
                this.updateVersions()
                break
              default:
                break
            }
            break
          default:
            break
        }
      }
    }
  }

  async startTest() {
    console.log('Start test for left = ', this.props.left)

    await this.requestSerialData()

    await sleep(2000)

    var counter = 0

    // Change this counter for change connection test time
    while (counter++ < 20 && this.running === true) {
      midi.loadState()
      await sleep(2000)
      this.getFirmwareVersions()
      await sleep(1000)
      if (this.isMidiConnected() === true) {
        if (this.props.left !== true && this.isRightIsConnected()) {
          this.testPassed()
          return
        }
        break
      }
    }
    if (this.props.left === true) {
      counter = 0

      console.log('test left for left = ', this.props.left, counter)

      while (counter++ < 20 && this.running === true) {
        this.getFirmwareVersions()
        await sleep(2000)
        if (this.isLeftIsConnected() === true) {
          this.testPassed()
          return
        }
      }
    }

    if (this.isMidiConnected() === false) {
      this.testFailed()
    }
  }

  testPassed() {
    if (this.running === true) {
      this.props.onTestResult !== undefined && this.props.onTestResult(true)
    }
  }

  testFailed = () => {
    if (this.running === true) {
      this.props.onTestResult !== undefined && this.props.onTestResult(false)
    }
  }

  render() {
    return (
      <>
        <div className="title-text text-center">
          Checking for firmware updates
        </div>

        <Loader />
      </>
    )
  }
}

export default ConnectionTest
