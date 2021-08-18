import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'
import Store from '../store'
import { observer } from 'mobx-react-lite'
import WelcomeScreen from '../components/screens/Welcome'
import WaitMidiConnect from '../components/screens/WaitMidiConnect'
import DeniedMidiAccess from '../components/screens/DeniedMidiAccess'

const Home = observer(() => {
  const router = useRouter()
  // STEP 2 (After click done btn in chrome)
  // Show Screen with info for connecting midi to Chrome
  // IF MIDI connection denied ---> Screen with information forn Denied access
  // IF MIDI connection accessed ---> Screen with firmware update
  const [isLoading, setisLoading] = useState(false)
  const [isDenied, setisDenied] = useState(false)
  const connectMidi = async () => {
    setisLoading(true)
    Store.initJammy()
      .then(() => {
        router.push('/sound-check')
      })
      .catch((err) => {
        debugger
        setisDenied(true)
        // setTimeout(() => connectMidi(midiAccess), 5000)
      })
      .finally(() => {
        setisLoading(false)
      })
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
})

export default Home
