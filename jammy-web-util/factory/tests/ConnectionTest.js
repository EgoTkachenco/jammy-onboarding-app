import React from 'react'
import { jammy, midiService as midi } from '../../../store'
import { sleep } from '../../services/utils'

class ConnectionTest extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      lfw: undefined,
    }
    this.startTest.bind(this.startTest)
  }

  connected = false

  isMidiConnected = () =>
    midi.activeInputs.length > 0 && midi.activeOutputs.length > 0

  isLeftIsConnected = () => this.state.lfw !== undefined && this.state.lfw >= 0

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
        if (this.props.left !== true) {
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

const Loader = () => {
  return (
    <div className="circle-loader">
      <svg
        width="46"
        height="46"
        viewBox="0 0 46 46"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <mask id="path-1-inside-1" fill="white">
          <path d="M23 0C17.3458 -6.74251e-08 11.8898 2.08271 7.67387 5.85037C3.45793 9.61804 0.777529 14.8066 0.144571 20.4252C-0.488388 26.0439 0.97045 31.6988 4.24248 36.31C7.5145 40.9212 12.3704 44.1656 17.8829 45.4235C23.3953 46.6815 29.178 45.8649 34.1265 43.1296C39.075 40.3944 42.8426 35.9322 44.7097 30.5952C46.5769 25.2582 46.4127 19.4205 44.2486 14.1969C42.0846 8.97327 38.0722 4.72983 32.9778 2.27696L31.2614 5.84171C35.4795 7.87263 38.8017 11.3861 40.5935 15.7112C42.3853 20.0362 42.5212 24.8698 40.9753 29.2887C39.4293 33.7076 36.3098 37.4022 32.2125 39.667C28.1152 41.9317 23.3273 42.6078 18.7631 41.5663C14.1989 40.5247 10.1783 37.8384 7.46911 34.0204C4.75994 30.2024 3.55205 25.5203 4.07612 20.8682C4.6002 16.216 6.81952 11.92 10.3102 8.80043C13.801 5.68087 18.3185 3.95642 23 3.95642V0Z" />
        </mask>
        <path
          d="M23 0C17.3458 -6.74251e-08 11.8898 2.08271 7.67387 5.85037C3.45793 9.61804 0.777529 14.8066 0.144571 20.4252C-0.488388 26.0439 0.97045 31.6988 4.24248 36.31C7.5145 40.9212 12.3704 44.1656 17.8829 45.4235C23.3953 46.6815 29.178 45.8649 34.1265 43.1296C39.075 40.3944 42.8426 35.9322 44.7097 30.5952C46.5769 25.2582 46.4127 19.4205 44.2486 14.1969C42.0846 8.97327 38.0722 4.72983 32.9778 2.27696L31.2614 5.84171C35.4795 7.87263 38.8017 11.3861 40.5935 15.7112C42.3853 20.0362 42.5212 24.8698 40.9753 29.2887C39.4293 33.7076 36.3098 37.4022 32.2125 39.667C28.1152 41.9317 23.3273 42.6078 18.7631 41.5663C14.1989 40.5247 10.1783 37.8384 7.46911 34.0204C4.75994 30.2024 3.55205 25.5203 4.07612 20.8682C4.6002 16.216 6.81952 11.92 10.3102 8.80043C13.801 5.68087 18.3185 3.95642 23 3.95642V0Z"
          stroke="#1B15FF"
          strokeWidth="12"
          mask="url(#path-1-inside-1)"
        />
      </svg>
    </div>
  )
}
