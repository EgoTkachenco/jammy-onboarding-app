import Image from 'next/image'
import { useState } from 'react'
import DeniedMidiAccess from '../screens/DeniedMidiAccess'
import FirmwareUpdate from './FirmwareUpdate'
import WelcomeScreen from '../screens/Welcome'

export default function ConnectMidiDevice() {
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setisConnected] = useState(null)

  const connectMidi = () => {
    setIsLoading(true)
    navigator.requestMIDIAccess().then(function (access) {
      // Get lists of available MIDI controllers
      const inputs = access.inputs.values()
      const outputs = access.outputs.values()

      access.onstatechange = function (e) {
        debugger
        // Print information about the (dis)connected MIDI controller
        console.log(e.port.name, e.port.manufacturer, e.port.state)
      }
    })
  }
  // if (isLoading) return <WaitMidiConnect />

  if (isConnected !== null)
    return isConnected ? <FirmwareUpdate /> : <DeniedMidiAccess />

  return (
    <div className="page-container no-navigation centered connect-midi-device">
      <div className="img">
        <Image src="/jammy-white-logo.svg" width={72} height={72} alt="Jammy" />
      </div>
      <div className="lg-text text-center">
        Hi there, thanks for choosing Jammy!
      </div>
      <div className="title-text text-center">
        Let`s fine-tune the device in <br /> accordance with your preferences.
      </div>
      <div className="lg-text text-center">
        To begin with, turn on your Jammy and connect it via a USB cable.
      </div>

      <button className="btn btn-primary" onClick={connectMidi}>
        Done
      </button>
    </div>
  )
}
