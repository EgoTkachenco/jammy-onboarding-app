import { useState } from 'react'
import Stepper from '../Stepper'
import Dialog from '../Dialog'
import PresetCustomize from './PresetCustomize'
import { useRouter } from 'next/router'
export default function Presets() {
  const router = useRouter()
  const [active, setactive] = useState(null)
  const [isCustomize, setisCustomize] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const PRESETS = [
    { id: 1, name: 'Clean Picking and Strumming' },
    { id: 2, name: 'Default (All Techniques)	' },
    { id: 3, name: 'Rock’n’Roll' },
    { id: 4, name: 'Shredding' },
    { id: 5, name: 'Tapping' },
    { id: 6, name: 'Tapping (Dampened Strings)' },
    { id: 7, name: 'Increased Picking Sensitivity' },
    { id: 8, name: 'Increased Tapping Sensitivity ' },
    { id: 9, name: 'Increased Right Hand Muting Sensitivity' },
    { id: 10, name: 'Increased Left Hand Muting Sensitivity' },
    { id: 11, name: 'Troubleshoot Self-Muting Strings' },
    { id: 12, name: 'Troubleshoot Tapping' },
  ]
  return (
    <>
      <Stepper
        onPrev={
          isCustomize
            ? () => setisCustomize(false)
            : () => router.push('/sound-check')
        }
        prevText={
          <div className="d-flex align-center">
            <ArrowIcon />
            {!isCustomize ? 'Previous Step' : 'Back'}
          </div>
        }
        onNext={
          active &&
          (isCustomize
            ? () => setisCustomize(false)
            : () => setShowDialog(true))
        }
        nextText={isCustomize ? 'Done' : 'Apply Selected Preset'}
      />
      <div className="page-container presets">
        {isCustomize ? (
          <PresetCustomize preset={active} />
        ) : (
          <>
            <div className="lg-text text-center">
              Try different presets to find the one that provides <br /> the
              best performance. You can then customize it.
            </div>
            {active && (
              <>
                <div className="presets-list">
                  <div className="sm-text white-50">User presets </div>
                  <div className="presets-list__item active">
                    <div className="md-text">{active.name}</div>
                    <button
                      className="btn btn-dark"
                      onClick={(e) => {
                        e.stopPropagation()
                        setisCustomize(true)
                      }}
                    >
                      Customize preset
                    </button>
                  </div>
                  <div className="sm-text white-50">
                    This preset will be overwritten when you press the button
                    “Customize preset”
                  </div>
                </div>
                <div className="custom-preset__line"></div>
              </>
            )}
            <div className="presets-list">
              <div className="sm-text white-50">Original </div>
              {PRESETS.map((preset) => (
                <div
                  className={`presets-list__item ${
                    active?.id == preset.id ? 'active' : ''
                  }`}
                  key={preset.id}
                  onClick={() => setactive(preset)}
                >
                  <div className="md-text">{preset.name}</div>
                  {active?.id == preset.id && (
                    <button
                      className="btn btn-dark"
                      onClick={(e) => {
                        e.stopPropagation()
                        setisCustomize(true)
                      }}
                    >
                      Customize preset
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
        {showDialog && (
          <Dialog close={() => setShowDialog(false)}>
            <div className="title-text">Happy with the result?</div>
            <button
              className="btn btn-primary"
              onClick={() => router.push('/software-settings')}
            >
              Yes
            </button>
            <button
              className="btn btn-primary"
              onClick={() => router.push('/midi-settings')}
            >
              {"No but I'd like to proceed to MIDI"}
            </button>
            <button
              className="btn btn-primary__outline"
              onClick={() => router.push('/support')}
            >
              {"No. I'd like to contact support"}
            </button>
          </Dialog>
        )}
      </div>
    </>
  )
}

const ArrowIcon = () => {
  return (
    <svg
      style={{ marginRight: '0.5rem' }}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 20L13.41 18.59L7.83 13L20 13L20 11L7.83 11L13.41 5.41L12 4L4 12L12 20Z"
        fill="white"
      />
    </svg>
  )
}
