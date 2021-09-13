import Head from 'next/head'
import Navigation from '../components/Navigation'
import Presets from '../components/presets/Presets'
export default function AdvancedSettings() {
  return (
    <>
      <Head>
        <title>Advanced Settings</title>
      </Head>
      <Navigation process={50} />
      <Presets />
    </>
  )
}
