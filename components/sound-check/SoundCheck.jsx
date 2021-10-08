import { useEffect, useState } from 'react'
import Chords from './Chords'
import MusicVisualizer from './MusicVisualizer'
import HelpTooltip from '../HelpTooltip'
import { observer } from 'mobx-react-lite'
import Store from '../../store'

const SoundCheck = observer(() => {
  const jammyName = Store.jammyName || 'Jammy E'
  const isPlaying = Store.isPlaying
  const [showMessage, setShowMessage] = useState(false)
  useEffect(() => {
    if (isPlaying && !showMessage) setTimeout(() => setShowMessage(true), 20000)
  }, [isPlaying])
  const videoLink =
    jammyName === 'Jammy G' ? '/videos/Jammy G.mp4' : '/videos/Jammy_E.mp4'
  return (
    <>
      <div className="page-container sound-check centered">
        <div className={`message ${showMessage ? 'show' : ''}`}>
          To optimize the responsiveness, adjust the string tension to match a
          regular guitar feel (use the hex key from the box).{' '}
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
        muted="muted"
      ></video>
    </>
  )
})

export default SoundCheck
