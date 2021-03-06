import { useState } from 'react'
import Stepper from '../Stepper'
import Dialog from '../Dialog'
import { useRouter } from 'next/router'
import Store from '../../store'
import PresetsStore from '../../store/PresetsStore'
import { observer } from 'mobx-react-lite'
import {
  ConfiguratorG,
  ConfiguratorE,
} from '../../jammy-web-util/components/Configurator'

const Presets = observer(() => {
  const router = useRouter()
  const [showDialog, setShowDialog] = useState(false)
  const active = PresetsStore.activePreset
  const customizedPreset = PresetsStore.customizedPreset
  const isCustomize = PresetsStore.isCustomize
  const isFetch = PresetsStore.isFetch
  const isJammyG = Store.jammyName === 'Jammy G'

  const CONFIG = PresetsStore.config
  const PRESETS = PresetsStore.presets

  const setActivePreset = (preset, isCustom) =>
    PresetsStore.setActivePreset(preset, isCustom)
  const setCustomizedPreset = (preset) =>
    PresetsStore.setCustomizedPreset(preset)
  return (
    <>
      <Stepper
        onPrev={
          isCustomize
            ? () => {
                PresetsStore.isCustomize = false
                PresetsStore.activePreset = null
              }
            : () => router.push('/sound-check-2')
        }
        prevText={
          <div className="d-flex align-center">
            <ArrowIcon />
            {!isCustomize ? 'Previous Step' : 'Back'}
          </div>
        }
        onNext={
          customizedPreset || active
            ? () => {
                // PresetsStore.applyPreset(active)
                setShowDialog(true)
              }
            : null
        }
        nextText={!isCustomize ? 'Apply Selected Preset' : 'Done'}
      />
      <div className="page-container presets">
        {isFetch && (
          <div className="loader-wrapper">
            <div className="loader-1">
              <span></span>
            </div>
          </div>
        )}
        {isCustomize ? (
          isJammyG ? (
            <ConfiguratorG
              config={CONFIG}
              preset={customizedPreset.preset}
              presetName={customizedPreset?.name}
            />
          ) : (
            <ConfiguratorE
              config={CONFIG}
              preset={customizedPreset.preset}
              presetName={customizedPreset?.name}
            />
          )
        ) : (
          <>
            <div className="lg-text text-center">
              Try different presets to find the one that provides <br /> the
              best performance. You can then customize it.
            </div>
            {customizedPreset && (
              <>
                <div className="presets-list">
                  <div className="sm-text white-50">User presets </div>
                  <div
                    onClick={() => setActivePreset(customizedPreset, true)}
                    className={`presets-list__item ${!active ? 'active' : ''}`}
                  >
                    <div className="md-text">Custom preset</div>
                    {!active && (
                      <button
                        className="btn btn-dark"
                        onClick={(e) => {
                          e.stopPropagation()
                          PresetsStore.isCustomize = true
                        }}
                      >
                        Customize
                      </button>
                    )}
                  </div>
                  <div className="sm-text white-50">
                    This preset will be overwritten when you press the button
                    ???Customize???
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
                  onClick={() => PresetsStore.setActivePreset(preset)}
                >
                  <div className="md-text">{preset.name}</div>
                  {active?.id == preset.id && (
                    <button
                      className="btn btn-dark"
                      onClick={(e) => {
                        e.stopPropagation()
                        PresetsStore.setCustomizedPreset(preset)
                      }}
                    >
                      Customize
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
        {showDialog && (
          <Dialog close={() => setShowDialog(false)}>
            <div className="title-text text-center">
              Proceed to <br /> MIDI settings?
            </div>
            <button
              className="btn btn-primary"
              onClick={() => router.push('/software-settings')}
            >
              Yes
            </button>
            {/* <button
              className="btn btn-primary__outline"
              onClick={() => router.push('/sensitivity')}
            >
              {'No, I???d like to troubleshoot playability'}
            </button> */}
          </Dialog>
        )}
      </div>
    </>
  )
})
export default Presets

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
