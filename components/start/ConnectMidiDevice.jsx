import Image from 'next/image'
import { useState } from 'react'
import DeniedMidiAccess from './DeniedMidiAccess'
import FirmwareUpdate from './FirmwareUpdate'
export default function ConnectMidiDevice() {
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setisConnected] = useState(null)
  const connectMidi = () => {
    setIsLoading(true)
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(success, failure)
    }
    function success(midi) {
      console.log('Got midi!', midi)
      setIsLoading(false)
      setisConnected(true)
    }

    function failure() {
      console.error('No access to your midi devices.')
      setIsLoading(false)
    }
  }
  if (isLoading) return <WaitMidiConnect />
  if (isConnected !== null)
    return isConnected ? <FirmwareUpdate /> : <DeniedMidiAccess />

  return (
    <div className="page-container no-navigation centered connect-midi-device">
      <div className="img">
        <Image src="/jammy-white-logo.svg" width={72} height={72} alt="Jammy" />
      </div>
      <div className="lg-text text-center white">
        Hi there, thanks for choosing Jammy!
      </div>
      <div className="title-text text-center white">
        Let`s fine-tune the device in <br /> accordance with your preferences.
      </div>
      <div className="lg-text text-center white">
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
