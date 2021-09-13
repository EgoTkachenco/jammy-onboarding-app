import { useRouter } from 'next/router'
import Store from '../store'
import { observer } from 'mobx-react-lite'
import StartScreen from '../components/screens/Start'
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
  }
  const activeTab = Store.startScreenTab
  const jammyName = Store.jammyName
  const isRebooted = Store.isRebooted

  const renderScreen = (activeTab) => {
    switch (activeTab) {
      case 'Start':
        return <StartScreen action={() => Store.startScreenTab = 'Welcome'} />
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
