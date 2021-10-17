import React, { Component } from 'react'

// import './FactoryTest.css'
import { MenuItem } from './tests/NavigationMenu'
import ConnectionTest from './tests/ConnectionTest'
import FailedTest from './tests/FailedTest'
import PassedTest from './tests/PassedTest'
import Store, { midiService as midi } from '../../store'
import { observer } from 'mobx-react-lite'
import FirmwareUpdate from './FirmwareUpdate'
import { useRouter } from 'next/router'

class FactoryTest extends Component {
  constructor(props) {
    super(props)
    this.state = {
      connected: false,
      test: this.firmwareUpdateTest,
      menuItem: this.firmwareUpdateTest.menu[0],
      versions: {
        lf: -1,
        lh: -1,
        rf: -1,
        rh: -1,
      },
      serial: -1,
    }

    this.nextState = this.nextState.bind(this)
    this.currentMenuIndex = this.currentMenuIndex.bind(this)
    this.onTestResultCallback = this.onTestResultCallback.bind(this)
  }

  componentDidMount() {
    this.setState({
      connected: Store.status === 'Connected',
    })
    console.log(this.state)
  }

  componentWillUnmount() {
    // midi.removeEventListener('midistatus', this.midiStatusListener)
  }

  currentMenuIndex = () => {
    let test = this.state.test
    let menu = this.state.menuItem
    return test === undefined || menu === undefined
      ? -1
      : test.menu.indexOf(menu)
  }

  nextState() {
    this.setState({ currentState: this.state.currentState + 1 })
  }

  currentTests = (type) => {
    return this.functionalTests
  }

  onVersion = (lf, lh, rf, rh) => {
    this.setState({
      versions: { lf: lf, lh: lh, rf: rf, rh: rh },
    })
    Store.versions = { lf: lf, lh: lh, rf: rf, rh: rh }
  }

  onSerial = (serial) => {
    this.setState({
      serial: serial,
    })
  }

  refreshPage = () => {
    window.location.reload()
  }

  render() {
    return (
      this.state.test !== undefined &&
      this.state.menuItem !== undefined &&
      this.state.menuItem.test
    )
  }

  onTestResultCallback = (passed) => {
    let currentTest = this.state.test
    let currentMenu = this.state.menuItem
    let m = this.currentMenuIndex()
    console.log(
      'Test Result Callback: passed = ',
      passed,
      ', menu length: ',
      currentTest.menu.length,
      ', test = ',
      currentTest.title,
      ', menu = ',
      currentMenu.title,
      ' - ',
      m
    )

    if (m !== -1) {
      if (passed) {
        if (m + 1 < currentTest.menu.length) {
          this.setState({
            menuItem: currentTest.menu[m + 1],
          })
        } else {
          let test = this.passedTest(this.state.test)
          this.setState({
            menuItem: MenuItem(-1, 'Passed', test),
          })
          this.props.router.push('/sound-check')
        }
      } else {
        let test = this.failedTest(this.state.menuItem, this.state.test)
        this.setState({
          menuItem: MenuItem(-1, 'Failed', test),
        })
        this.props.router.push('/sound-check')
      }
    }
  }

  failedTest = (menu, part) => {
    return <FailedTest test={menu.title} part={part.title} />
  }

  passedTest = (part) => {
    return <PassedTest part={part.title} />
  }

  firmwareUpdateTest = {
    title: 'Firmware Update',
    color: '#00aa00',
    menu: [
      MenuItem(
        1,
        'Connection (连接)',
        <ConnectionTest
          functional
          left={false}
          onTestResult={this.onTestResultCallback}
          onSerial={this.onSerial}
          onVersion={this.onVersion}
        />
      ),
      MenuItem(
        2,
        'Firmware Update',
        <FirmwareUpdate
          onTestResult={this.onTestResultCallback}
          lf={() => this.state.versions.lf}
          rf={() => this.state.versions.rf}
        />
      ),
      MenuItem(
        3,
        'Verification',
        <ConnectionTest
          functional
          left={false}
          onTestResult={this.onTestResultCallback}
          onSerial={this.onSerial}
          onVersion={this.onVersion}
        />
      ),
    ],
  }
}

export { FactoryTest }
