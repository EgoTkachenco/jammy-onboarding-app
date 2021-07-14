import Chords from './Chords'
import MusicVisualizer from './MusicVisualizer'
import HelpTooltip from '../HelpTooltip'
export function SoundCheck() {
  return (
    <div className="page-container sound-check">
      <div className="message">
        We recommend playing closer to the sensors (where both parts of your
        guitar connect) to increase the stability of note picking.{' '}
      </div>
      <div className="title-text text-center">
        Play some chords to check the responsiveness
      </div>
      <div className="sm-text text-center">
        Advanced guitar techniques will be set in the upcoming steps. <br />
        As for now, concentrate on clean picking and strumming.
      </div>
      <Chords />
      <MusicVisualizer />
      <HelpTooltip />
    </div>
  )
}

export default SoundCheck
