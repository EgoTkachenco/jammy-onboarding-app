import React from 'react'
import { jammy } from '../../store'
import { sleep } from '../services/utils'
import dfu from './dfu/dfu'
import dfuse from './dfu/dfuse'
import { Loader } from '../../components/Loader'
import { vendorIdDecimal, vendorIdHexadecimal } from '../constants/vendor-id'
import { LEFT_FIRMWARE, RIGHT_FIRMWARE } from '../constants/latest-firmware-versions'
import { flashState } from './constants/flash-state'
import { observer } from 'mobx-react'
import Store from '../../store'
import { StartUpdateState } from './components/StartUpdateState'
import { ConnectDSUState } from './components/ConnectDSUState'
import { FirmwareUpdateProgressState } from './components/FirmwareUpdateProgressState'
import { ErrorState } from './components/ErrorState'
import { DriverUpdateState } from './components/DriverUpdateState'

function hex4(n) {
  let s = n.toString(16)
  while (s.length < 4) {
    s = '0' + s
  }
  return s
}

function hexAddr8(n) {
  let s = n.toString(16)
  while (s.length < 8) {
    s = '0' + s
  }
  return '0x' + s
}

function niceSize(n) {
  const gigabyte = 1024 * 1024 * 1024
  const megabyte = 1024 * 1024
  const kilobyte = 1024
  if (n >= gigabyte) {
    return n / gigabyte + 'GiB'
  } else if (n >= megabyte) {
    return n / megabyte + 'MiB'
  } else if (n >= kilobyte) {
    return n / kilobyte + 'KiB'
  } else {
    return n + 'B'
  }
}

class FirmwareUpdate extends React.Component {
  // props.lf - left firmware
  // props.rf - right firmware
  constructor(props) {
    super(props)
    this.state = {
      ready: false,
      test: 'EMPTY',
      memorySummary: '',
      error: '',
      deviceInfo: '',
      inProgress: false,
      progress: 0,
      flashState: 'connecting'
    }
  }

  rebootInDFU = async () => {
    jammy.rebootJammyEInDFU()
    await sleep(50)
    jammy.rebootJammyEInDFU()
    await sleep(500)
  }

  rebootInMIDI = async () => {
    await this.device.do_leave()
  }

  isNeedToUpdate = () => {
    return this.props.lf() !== LEFT_FIRMWARE || this.props.rf() !== RIGHT_FIRMWARE
  }

  componentDidMount = async () => {
    this.setState({
      ready: false
    })

    if (this.isNeedToUpdate()) {
      this.setState({
        ready: true
      })
    } else {
      this.testPassed()
    }
  }

  testPassed() {
    this.props.onTestResult !== undefined && this.props.onTestResult(true)
  }

  testFailed = () => {
    this.props.onTestResult !== undefined && this.props.onTestResult(false)
  }

  fixInterfaceNames = async (device_, interfaces) => {
    // Check if any interface names were not read correctly
    if (interfaces.some((intf) => intf.name === null)) {
      // Manually retrieve the interface name string descriptors
      let tempDevice = new dfu.Device(device_, interfaces[0])
      await tempDevice.device_.open()
      await tempDevice.device_.selectConfiguration(1)
      let mapping = await tempDevice.readInterfaceNames()
      await tempDevice.close()

      for (let intf of interfaces) {
        if (intf.name === null) {
          let configIndex = intf.configuration.configurationValue
          let intfNumber = intf['interface'].interfaceNumber
          let alt = intf.alternate.alternateSetting
          intf.name = mapping[configIndex][intfNumber][alt]
        }
      }
    }
  }

  onDisconnect = (error) => {
    this.setState({
      error: error,
      isProgress: false
    })
  }

  getDFUDescriptorProperties = (device) => {
    // Attempt to read the DFU functional descriptor
    // TODO: read the selected configuration's descriptor
    return device.readConfigurationDescriptor(0).then(
      (data) => {
        let configDesc = dfu.parseConfigurationDescriptor(data)
        let funcDesc = null
        let configValue = device.settings.configuration.configurationValue
        if (configDesc.bConfigurationValue === configValue) {
          for (let desc of configDesc.descriptors) {
            if (
              desc.bDescriptorType === 0x21 &&
              desc.hasOwnProperty('bcdDFUVersion')
            ) {
              funcDesc = desc
              break
            }
          }
        }

        if (funcDesc) {
          return {
            WillDetach: (funcDesc.bmAttributes & 0x08) !== 0,
            ManifestationTolerant: (funcDesc.bmAttributes & 0x04) !== 0,
            CanUpload: (funcDesc.bmAttributes & 0x02) !== 0,
            CanDnload: (funcDesc.bmAttributes & 0x01) !== 0,
            TransferSize: funcDesc.wTransferSize,
            DetachTimeOut: funcDesc.wDetachTimeOut,
            DFUVersion: funcDesc.bcdDFUVersion
          }
        } else {
          return {}
        }
      },
      (error) => {
      }
    )
  }

  connect = async (device, update) => {
    try {
      await device.open()
    } catch (error) {
      this.onDisconnect(error)
      throw error
    }

    // Attempt to parse the DFU functional descriptor
    let desc = {}
    try {
      desc = await this.getDFUDescriptorProperties(device)
    } catch (error) {
      this.onDisconnect(error)
      throw error
    }

    if (desc && Object.keys(desc).length > 0) {
      device.properties = desc
      let info = `WillDetach=${desc.WillDetach}, ManifestationTolerant=${desc.ManifestationTolerant
      }, CanUpload=${desc.CanUpload}, CanDnload=${desc.CanDnload
      }, TransferSize=${desc.TransferSize}, DetachTimeOut=${desc.DetachTimeOut
      }, Version=${hex4(desc.DFUVersion)}`

      this.setState({
        test: info
      })

      this.transferSizeField = desc.TransferSize
      this.transferSize = desc.TransferSize

      if (desc.CanDnload) {
        this.manifestationTolerant = desc.ManifestationTolerant
      }

      if (device.settings.alternate.interfaceProtocol === 0x02) {
        if (!desc.CanDnload) {
          this.setState({
            isProgress: true
          })
        }
      }
      if (
        desc.DFUVersion === 0x011a &&
        device.settings.alternate.interfaceProtocol === 0x02
      ) {
        device = new dfuse.Device(device.device_, device.settings)

        if (device.memoryInfo) {
          let totalSize = 0
          for (let segment of device.memoryInfo.segments) {
            totalSize += segment.end - segment.start
          }
          this.setState({
            memorySummary: `Selected memory region: ${device.memoryInfo.name
            } (${niceSize(totalSize)})`
          })
          for (let segment of device.memoryInfo.segments) {
            let properties = []
            if (segment.readable) {
              properties.push('readable')
            }
            if (segment.erasable) {
              properties.push('erasable')
            }
            if (segment.writable) {
              properties.push('writable')
            }
            let propertySummary = properties.join(', ')
            if (!propertySummary) {
              propertySummary = 'inaccessible'
            }

            this.setState({
              memorySummary: (this.state.memorySummary += `\n${hexAddr8(
                segment.start
              )}-${hexAddr8(segment.end - 1)} (${propertySummary})`)
            })
          }

          if (update === true) {
            // TODO: Migrate to common way
            const remote = 'https://start.playjammy.com'
            const host = 'http://localhost:3000'

            const je_fw_latest_path = ((window.location.hostname === 'localhost') ? host : remote) + '/fw/je_fw_latest.bin'

            fetch(je_fw_latest_path)
              .then((response) => {
                return response.arrayBuffer()
              })
              .then(async (data) => {
                this.firmwareFile = data
                await this.download()
              })
              .then(async () => {
                if (update) {
                  await this.rebootInMIDI()
                  await sleep(2000)
                  this.testPassed()

                  Store.setIsUpdating(false)
                }
              })
          }
        }
      }
    }

    if (device.memoryInfo) {
      let segment = device.getFirstWritableSegment()
      if (segment) {
        device.startAddress = segment.start
      }
    }

    this.setState({
      deviceInfo: JSON.stringify(device)
    })

    return device
  }

  download = async () => {
    if (this.device && this.firmwareFile != null) {
      try {
        let status = await this.device.getStatus()
        if (status.state === dfu.dfuERROR) {
          await this.device.clearStatus()
        }
      } catch (error) {
        this.device.logWarning('Failed to clear status')
      }

      this.device.flashState = (s) => {
        this.setState({
          flashState: s
        })
      }

      this.device.logProgress = (p, t) => {
        let percentage = ((p / t) * 50) | 0

        if (this.state.flashState === 'download') {
          percentage = percentage + 50
        }

        this.setState({
          progress: percentage
        })
      }

      try {
        await this.device
          .do_download(
            this.transferSize,
            this.firmwareFile,
            this.manifestationTolerant
          )
      } catch (error) {
        console.log(error)
      }

      console.log(
        'Done! s: ' +
        this.transferSize +
        ', t: ' +
        this.manifestationTolerant
      )
      if (!this.manifestationTolerant) {
        this.device.waitDisconnected(5000).then(
          () => {
            this.onDisconnect()
            this.device = null
          },
          () => {
            // It didn't reset and disconnect for some reason...
            console.log('Device unexpectedly tolerated manifestation.')
          }
        )
      }
    }
  }

  getJammyDevice = async () => {
    const availableDevices = await navigator.usb.getDevices()
    let jammyDevice = availableDevices.find((usbDevice) => usbDevice.vendorId === vendorIdDecimal)
    const isJammyAvailable = !!jammyDevice

    if (!isJammyAvailable) {
      this.setState({ flashState: 'navigator' })

      try {
        jammyDevice = await navigator.usb.requestDevice({
          filters: [
            {
              vendorId: vendorIdHexadecimal
            }
          ]
        })
      } catch (error) {
        this.setState({
          test: this.state.test + '\nConnect ERROR: ' + error
        })
      }
    }

    return jammyDevice
  }

  startUpdate = async () => {
    Store.setIsUpdating(true)

    this.setState({
      flashState: 'loader'
    })

    await this.rebootInDFU();

    let jammyDevice = await this.getJammyDevice();
    const isDriverUpdateNeeded = await this.isDriverUpdateNeeded(jammyDevice)

    if (isDriverUpdateNeeded) {
      this.setState({
        flashState: flashState.driverUpdate,
      });

      return;
    }

    let interfaces = dfu.findDeviceDfuInterfaces(jammyDevice)

    this.setState({
      test: this.state.test + '\nDevice:\n' + JSON.stringify(interfaces)
    })

    if (interfaces.length === 0) {
      this.setState({
        test:
          this.state.test +
          '\nThe selected device does not have any USB DFU interfaces.'
      })
    } else if (interfaces.length === 1) {
      await this.fixInterfaceNames(jammyDevice, interfaces)

      this.setState({
        test:
          this.state.test +
          '\nConnect to ' +
          JSON.stringify(jammyDevice)
      })

      this.device = await this.connect(
        new dfu.Device(jammyDevice, interfaces[0]),
        true
      )
    }
  }

  isWindowsPlatform () {
    return navigator.platform.includes('Win');
  }

  isDriverUpdateNeeded = async (device) => {
    if (!this.isWindowsPlatform()) {
      return false;
    }

    try {
      await device.open()

      return false
    } catch (e) {
      return true
    }
  }

  render() {
    if (this.state.ready && this.state.flashState === flashState.connecting) {
      return (
        <StartUpdateState onUpdateClick={this.startUpdate} />
      )
    } else if (this.state.flashState === flashState.navigator) {
      return (
        <ConnectDSUState />
      )
    } else if (
      this.state.flashState === flashState.erase ||
      this.state.flashState === flashState.download
    ) {
      return (
        <FirmwareUpdateProgressState progress={this.state.progress} />
      )
    } else if (this.state.error && this.state.error.length > 0) {
      return (
        <ErrorState error={this.state.error} />
      )
    } else if (this.state.flashState === flashState.driverUpdate) {
      return <DriverUpdateState onUpdateClick={this.startUpdate} />;
    }
    else {
      return <Loader />
    }
  }
}

export default observer(FirmwareUpdate)


