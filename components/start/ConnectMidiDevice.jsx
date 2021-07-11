import Image from 'next/image'
import { useState } from 'react'
import DeniedMidiAccess from './DeniedMidiAccess'
import FirmwareUpdate from './FirmwareUpdate'
export default function ConnectMidiDevice() {
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setisConnected] = useState(null)
  const connectMidi = () => {
    setIsLoading(true)
    navigator.requestMIDIAccess().then(function (access) {
      // Get lists of available MIDI controllers
      const inputs = access.inputs.values()
      const outputs = access.outputs.values()

      setTimeout(() => {
        setIsLoading(false)
        setisConnected(true)
      }, 1500)

      access.onstatechange = function (e) {
        debugger
        // Print information about the (dis)connected MIDI controller
        console.log(e.port.name, e.port.manufacturer, e.port.state)
      }
    })
  }
  if (isLoading) return <WaitMidiConnect />
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

function WaitMidiConnect() {
  return (
    <div className="page-container no-navigation centered wait-midi-connect">
      <div className="img">
        <Image src="/jammy-white-logo.svg" width={72} height={72} alt="Jammy" />
      </div>
      <div className="lg-text white text-center">
        Allow this page to access MIDI devices so <br /> we could sync with your
        Jammy
      </div>
    </div>
  )
}
