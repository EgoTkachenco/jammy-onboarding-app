import Head from 'next/head'
import Navigation from '../components/Navigation'
import SoundCheckCmp from '../components/sound-check/SoundCheck'
import Stepper from '../components/Stepper'
import { useRouter } from 'next/router'
import MIDISynth from '../components/sound-check/MIDISynth'
export default function SoundCheck() {
  const router = useRouter()
  return (
    <>
      <Head>
        <title>Sound Check</title>
      </Head>
      <Navigation process={60} />
      <Stepper
        onNext={() => router.push('/sound-check-2')}
        nextText="Next step"
      />
      <SoundCheckCmp />
      {/* Sound generator*/}
      <MIDISynth />
    </>
  )
}
