import { useRouter } from 'next/router'
import Store from '../store'
import { observer } from 'mobx-react-lite'
import WelcomeScreen from '../components/screens/Welcome'
import WaitMidiConnect from '../components/screens/WaitMidiConnect'
import DeniedMidiAccess from '../components/screens/DeniedMidiAccess'
import {
  CheckingForUpdate,
  Updating,
  Reboot,
} from '../components/start/FirmwareUpdate'

const Home = observer(() => {
  const router = useRouter()
  // STEP 2 (After click done btn in chrome)
  // Show Screen with info for connecting midi to Chrome
  // IF MIDI connection denied ---> Screen with information forn Denied access
  // IF MIDI connection accessed ---> Screen with firmware update
  const connectMidi = async () => {
    Store.initJammy()
      .then(() => {
        router.push('/sound-check')
      })
      .catch((err) => {
        debugger
        // setisDenied(true)
        // setTimeout(() => connectMidi(midiAccess), 5000)
      })
      .finally(() => {
        // setisLoading(false)
      })
  }
  const activeTab = Store.startScreenTab
  const jammyName = Store.jammyName
  const isRebooted = Store.isRebooted

  const renderScreen = (activeTab) => {
    switch (activeTab) {
      case 'Welcome':
        return <WelcomeScreen action={connectMidi} />
      case 'Waiting':
        return <WaitMidiConnect />
      case 'Denied':
        return <DeniedMidiAccess action={() => window.location.reload(true)} />
      case 'CheckFirmware':
        return <CheckingForUpdate process={50} />
      case 'UpdateFirmware':
        return <Updating />
      case 'Reboot':
        return (
          <Reboot
            jammyName={jammyName}
            isRebooted={isRebooted}
            init={connectMidi}
          />
        )
      default:
        return null
    }
  }

  return <>{renderScreen(activeTab)}</>
})

export default Home
