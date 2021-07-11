import Head from 'next/head'
import Navigation from '../components/Navigation'
import SoundCheckCmp from '../components/sound-check/SoundCheck'

export default function SoundCheck() {
  return (
    <>
      <Head>
        <title>Sound Check</title>
      </Head>
      <Navigation process={60} />
      <SoundCheckCmp />
    </>
  )
}
