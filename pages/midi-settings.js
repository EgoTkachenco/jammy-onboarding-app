import Head from 'next/head'
import Navigation from '../components/Navigation'
import { MidiSettings } from '../components/midi-settings/MidiSettings'

export default function MidiSettingsPage () {
  return (
    <>
      <Head>
        <title>Midi Settings</title>
      </Head>

      <Navigation process={100} />
      <MidiSettings />
    </>
  )
}
