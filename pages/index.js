import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'

import WelcomeScreen from '../components/screens/Welcome'
import WaitMidiConnect from '../components/screens/WaitMidiConnect'
import DeniedMidiAccess from '../components/screens/DeniedMidiAccess'

export default function Home() {
  // On this screen we should check user browser \ connect to MIDI and update firmware

  // STEP 1
  // Check browser
  // IF NOT Chrome ---> Screen with Chrome installation
  // IF Chrome ---> Screen with message to connect midi
  const router = useRouter()
  if (process.browser && !window.chrome) router.push('/chrome-required')

  // STEP 2 (After click done btn in chrome)
  // Show Screen with info for connecting midi to Chrome
  // IF MIDI connection denied ---> Screen with information forn Denied access
  // IF MIDI connection accessed ---> Screen with firmware update
  const [isLoading, setisLoading] = useState(false)
  const [isDenied, setisDenied] = useState(false)

  const connectMidi = () => {
    setisLoading(true)
    function onMIDISuccess(midiAccess) {
      setisLoading(false)
      console.log('MIDI ready!')
      console.log(midiAccess)
    }

    function onMIDIFailure(msg) {
      setisLoading(false)
      setisDenied(true)
      console.log('Failed to get MIDI access - ' + msg)
    }
    navigator
      .requestMIDIAccess({ sysex: true })
      .then(onMIDISuccess, onMIDIFailure)
  }

  const renderScreen = () => {
    if (!isDenied && !isLoading) return <WelcomeScreen action={connectMidi} />
    if (!isDenied && isLoading) return <WaitMidiConnect />
    if (isDenied)
      return <DeniedMidiAccess action={() => window.location.reload(true)} />
  }

  return (
    <>
      <Head>
        <title>My page title</title>
      </Head>

      {renderScreen()}
    </>
  )
}
