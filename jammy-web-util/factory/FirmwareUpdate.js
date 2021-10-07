import React from 'react'
import Image from 'next/image'
import { jammy } from '../../store'
import { sleep } from '../services/utils'
import dfu from './dfu/dfu'
import dfuse from './dfu/dfuse'

import je_fw_latest from '../../public/fw/je_fw_latest.bin'

const LEFT_FIRMWARE = 9
const RIGHT_FIRMWARE = 3

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
      flashState: 'connecting',
    }
  }

  rebootInDFU = async () => {
    console.log('Reboot: DFU')
    jammy.rebootJammyEInDFU()
    await sleep(50)
    jammy.rebootJammyEInDFU()
    await sleep(4000)
    this.setState({
      ready: true,
    })
  }

  rebootInMIDI = async () => {
    console.log('Reboot: MIDI')
    await this.device.do_leave()
  }

  componentDidMount() {
    this.setState({
      ready: false,
    })
    if (this.props.lf() !== LEFT_FIRMWARE || this.props.rf() !== RIGHT_FIRMWARE) {
      this.rebootInDFU().then(() => {
        // Finish
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
      isProgress: false,
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
            DFUVersion: funcDesc.bcdDFUVersion,
          }
        } else {
          return {}
        }
      },
      (error) => { }
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
        test: info,
      })
      this.transferSizeField = desc.TransferSize
      this.transferSize = desc.TransferSize
      if (desc.CanDnload) {
        this.manifestationTolerant = desc.ManifestationTolerant
      }

      if (device.settings.alternate.interfaceProtocol === 0x02) {
        if (!desc.CanDnload) {
          this.setState({
            isProgress: true,
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
              } (${niceSize(totalSize)})`,
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
              )}-${hexAddr8(segment.end - 1)} (${propertySummary})`),
            })
          }

          if (update === true) {


            // TODO: Migrate to common way
            const remote = 'https://start.playjammy.com'
            const host = 'http://localhost:3000'

            const je_fw_latest_path = ((window.location.hostname === 'localhost') ? host : remote) + '/fw/je_fw_latest.bin';

            console.log("Fetch firmware from: ", je_fw_latest_path);

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
      deviceInfo: JSON.stringify(device),
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
        console.log("Flash state to: ", s)
        this.setState({
          flashState: s,
        })
      }

      this.device.logProgress = (p, t) => {
        const percentage = ((p / t) * 100) | 0;
        console.log("Update progress: ", p, "from: ", t, "percentage: ", percentage)
        this.setState({
          progress: percentage,
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
          (dev) => {
            this.onDisconnect()
            this.device = null
          },
          (error) => {
            // It didn't reset and disconnect for some reason...
            console.log('Device unexpectedly tolerated manifestation.')
          }
        )
      }
    }
  }

  connectToJammy = async (update = true) => {
    this.setState({ flashState: 'navigator' })
    navigator.usb
      .requestDevice({
        filters: [
          {
            vendorId: 0x0483,
          },
        ],
      })
      .then(async (selectedDevice) => {
        let interfaces = dfu.findDeviceDfuInterfaces(selectedDevice)
        this.setState({
          test: this.state.test + '\nDevice:\n' + JSON.stringify(interfaces),
        })
        if (interfaces.length === 0) {
          console.log(selectedDevice)
          this.setState({
            test:
              this.state.test +
              '\nThe selected device does not have any USB DFU interfaces.',
          })
        } else if (interfaces.length === 1) {
          await this.fixInterfaceNames(selectedDevice, interfaces)
          this.setState({
            test:
              this.state.test +
              '\nConnect to ' +
              JSON.stringify(selectedDevice),
          })
          this.device = await this.connect(
            new dfu.Device(selectedDevice, interfaces[0]),
            update
          )
        }
      })
      .catch((error) => {
        this.setState({
          test: this.state.test + '\nConnect ERROR: ' + error,
        })
      })
  }

  render() {
    if (this.state.ready && this.state.flashState === 'connecting') {
      return (
        <>
          <div className="title-text text-center">
            Checking for firmware updates
          </div>
          <br />
          <button
            className="btn btn-primary"
            onClick={() => this.connectToJammy()}
          >
            Start update
          </button>
        </>
      )
    } else if (this.state.flashState === 'navigator') {
      return (
        <div className="text-center">
          <div className="img">
            <Image
              src="/jammy-white-logo.svg"
              width={72}
              height={72}
              alt="Jammy"
            />
          </div>
          <br />
          <div className="lg-text white text-center">
            For firmware updates, Select Jammy DFU <br /> and click connect.
          </div>
        </div>
      )
    } else if (
      this.state.flashState === 'erase' ||
      this.state.flashState === 'download'
    ) {
      return (
        <>
          <div className="title-text text-center">
            Installing the latest firmware
          </div>
          <LoaderLine width={this.state.progress + '%'} />
          <div className="lg-text white text-center">
            {this.state.progress + '%'}
          </div>
        </>
      )
    } else if (this.state.error && this.state.error.length > 0) {
      return (
        <>
          <p>Error: </p>
          <p>{this.state.error}</p>
        </>
      )
    } else {
      return <Loader />
    }
  }
}

export default FirmwareUpdate

const LoaderLine = ({ width }) => {
  return (
    <div className="loader-line-wrapper">
      <div className="loader-line-value" style={{ width: width }}></div>
    </div>
  )
}
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
