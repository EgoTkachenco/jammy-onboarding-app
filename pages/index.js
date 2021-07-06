import ConnectMidiDevice from '../components/start/ConnectMidiDevice'
import { useRouter } from 'next/router'
export default function Home() {
  // On this screen we should check user browser \ connect to MIDI and update firmware

  // STEP 1
  // Check browser
  // IF NOT Chrome ---> Screen with Chrome installation
  // IF Chrome ---> Screen with message to connect midi
  let isChrome = false
  const router = useRouter()
  if (process.browser) isChrome = !!window.chrome
  if (process.browser && !isChrome) router.push('/chrome-required')

  // STEP 2 (After click done btn in chrome)
  // Show Screen with info for connecting midi to Chrome
  // IF MIDI connection denied ---> Screen with information forn Denied access
  // IF MIDI connection accessed ---> Screen with firmware update

  return <ConnectMidiDevice />
}
