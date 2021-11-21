import React, { useState, Fragment } from 'react'
import { useRouter } from 'next/router'
import Stepper from '../Stepper'
import Select from '../Select'
import { observer } from 'mobx-react-lite'
import MidiPresetsStore from '../../store/MidiPresetsStore'
import InfoBtn from '../InfoBtn'
import { ArrowIcon } from './components/ArrowIcon'
import { getSettingInfo } from './utils/get-setting-info'
import { FinishOnboardingDialog } from './components/FinishOnboardingDialog'
import { SettingInput } from './components/SettingInput'
import { getValuesRange } from './utils/get-values-range'
import { mappedSettingCategories, settingCategories } from './constants/setting-categories'

export const MidiSettings = observer(() => {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isOnboardingDone, setIsOnboardingDone] = useState(false);
  const activePreset = MidiPresetsStore.activePreset
  const handleChange = MidiPresetsStore.changePresetValue;

  const getParamRow = (param, group, global) => {
    if (global) {
      return (
        <div className="midi-list__item" key={param.id}>
          <div className="midi-list__item__label">{param.name}</div>
          <div className="midi-list__item__input">
            <SettingInput
              onChange={(value) => handleChange(param, group, { value }, global)}
              global={global}
              param={param}
              group={group}
            />
          </div>
        </div>
      )
    }

    return (
      <>
        {[0, 1, 2, 3, 4, 5].map((string) => {
          return (
            <div className="midi-list__item" key={string}>
              <div className="midi-list__item__label">String {string + 1}</div>
              <div className="midi-list__item__input">
                <Select
                  value={param.name + ' ' + param.values[string]}
                  options={getValuesRange(param.min, param.max)}
                  getOption={(option) => param.name + ' ' + option}
                  onChange={(v) =>
                    handleChange(param, group, { string, value: v }, global)
                  }
                />
              </div>
            </div>
          )
         }
        )}
      </>
    )
  }

  return (
    <>
      <Stepper
        onPrev={() => router.push('/software-settings')}
        prevText={
          <div className="d-flex align-center">
            <ArrowIcon />
            Back
          </div>
        }
        onNext={() => setIsDialogOpen(true)}
        nextText="Done"
      />

      <div className="page-container midi-settings">
        <div className="lg-text text-center">MIDI settings</div>

        <div className="md-text text-center white-50">
          We’ve already applied a MIDI preset to your Jammy so open your DAW of
          choice, <br /> assign a virtual instrument, and check the performance.
        </div>

        <div className="midi-list">
          {activePreset && mappedSettingCategories.map((settingCategory) => {
            return activePreset[settingCategory].map((group) => {
              return (
                <Fragment key={group.id}>
                  <div className="md-text white-50 d-flex">
                    <span>{group.title}</span>

                    <div className="m-l-10">
                      <InfoBtn info={getSettingInfo(settingCategory, group.groupId)} />
                    </div>
                  </div>

                  {group.params.map((param) => getParamRow(param, group, settingCategory === settingCategories.global))}
                </Fragment>
              )
            })
          })}
        </div>

        {isDialogOpen && (
          <FinishOnboardingDialog
            isOnboardingDone={isOnboardingDone}
            setIsDialogOpen={setIsDialogOpen}
            setIsOnboardingDone={setIsOnboardingDone}
          />
        )}
      </div>
    </>
  )
})
