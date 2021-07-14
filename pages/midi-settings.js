import Head from 'next/head'
import Navigation from '../components/Navigation'
import Midi from '../components/midi-settings/Midi'
export default function MidiSettings() {
  return (
    <>
      <Head>
        <title>Midi Settings</title>
      </Head>
      <Navigation process={80} />
      <Midi />
    </>
  )
}
