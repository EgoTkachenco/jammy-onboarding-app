import { useEffect, useState } from 'react'
import Chords from './Chords'
import MusicVisualizer from './MusicVisualizer'
import HelpTooltip from '../HelpTooltip'
import { observer } from 'mobx-react-lite'
import Store from '../../store'
const SoundCheck = observer(() => {
  const jammyName = Store.jammyName || 'Jammy E'
  const [showMessage, setShowMessage] = useState(false)
  useEffect(() => {
    setTimeout(() => setShowMessage(true), 2000)
  }, [])
  const videoLink =
    jammyName === 'Jammy G' ? '/videos/Jammy G.mp4' : '/videos/Jammy_E.mp4'
  return (
    <>
      <div className="page-container sound-check centered">
        <div className={`message ${showMessage ? 'show' : ''}`}>
          We recommend playing closer to the sensors (where both parts of your
          guitar connect) to increase the stability of note picking.{' '}
        </div>
        <div className="lg-text text-center">
          Play some chords to check the responsiveness
        </div>
        <div className="sm-text text-center">
          Advanced guitar techniques will be set in the following steps. <br />{' '}
          For now, focus on clean picking and strumming.
        </div>
        <Chords />
        <MusicVisualizer isPlaying={Store.isPlaying} />
        {/* <HelpTooltip /> */}
      </div>
      <video
        className="video__back"
        src={videoLink}
        autoPlay
        loop
        muted="muted"
      ></video>
    </>
  )
})

export default SoundCheck
