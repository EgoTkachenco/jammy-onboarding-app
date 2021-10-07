import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Stepper from '../Stepper'
import Dialog from '../Dialog'
import Select from '../Select'
import Range from '../Range'
import { observer } from 'mobx-react-lite'
import { Switch } from 'antd'
import MidiPresetsStore from '../../store/MidiPresetsStore'
const Midi = observer(() => {
  const router = useRouter()
  const [dialog, setDialog] = useState(false)
  const activePreset = MidiPresetsStore.activePreset
  const onChange = (param, group, value, global) =>
    MidiPresetsStore.changePresetValue(param, group, value, global)

  const getParamInput = (param, group, global) => {
    switch (param.type) {
      case 'INT':
        return (
          <Range
            value={param.values[0]}
            min={param.min}
            max={param.max}
            onChange={(v) => onChange(param, group, v, global)}
          />
        )
      case 'LIST':
        return (
          <Select
            value={
              param.options.find((option) => option.id === param.values[0])?.name || null
            }
            options={param.options}
            getOption={(option) => option.name}
            onChange={(v, i) => onChange(param, group, v.id, global)}
          />
        )
      case 'BOOL':
        return (
          <Switch
            defaultChecked={param.value === 1}
            onChange={(v) => onChange(param, group, v ? 1 : 0, global)}
          />
        )
      default:
        return 'DEF'
    }
  }

  const range = (start, end) => {
    return Array.apply(0, Array(end - 1))
      .map((element, index) => index + start);
  }

  const getParamRow = (param, group, global) => {
    if (!global) {
      return (
        <>
          {[0, 1, 2, 3, 4, 5].map((string) => (
            <div className="midi-list__item" key={string}>
              <div className="midi-list__item__label">
                String {string + 1}
              </div>
              <div className="midi-list__item__input">
                <Select
                  value={param.name + ' ' + param.values[string]}
                  options={range(param.min, param.max)}
                  getOption={(option) => param.name + ' ' + option}
                  onChange={(v, i) =>
                    onChange(param, group, { string, value: v - 1 }, global)
                  }
                />
              </div>
            </div>
          ))}
        </>
      )
    } else {
      return (
        <div className="midi-list__item" key={param.id}>
          <div className="midi-list__item__label">{param.name}</div>
          <div className="midi-list__item__input">
            {getParamInput(param, group, global)}
          </div>
          {/* <Select value={setting.value} options={setting.options} /> */}
        </div>
      )
    }
  }
  var result = ""
  for(var i = 33; i< 127; i++){
      result += i + ", "
  }
  console.log(result)

  return (
    <>
      <Stepper
        onPrev={() => router.push('/software-settings-2')}
        prevText={
          <div className="d-flex align-center">
            <ArrowIcon />
            Back
          </div>
        }
        onNext={() => setDialog(true)}
        nextText="Done"
      />
      <div className="page-container midi-settings">
        <div className="lg-text text-center">MIDI settings</div>
        <div className="md-text text-center white-50">
          We’ve already applied a MIDI preset to your Jammy so open your DAW of
          choice, <br /> assign a virtual instrument, and check the performance.
        </div>
        <div className="midi-list">
          {activePreset &&
            activePreset.groups.map((group) => (
              <React.Fragment key={group.id}>
                <div className="md-text white-50">{group.title}</div>
                {group.params.map((param) => getParamRow(param, group, false))}
              </React.Fragment>
            ))}
          {activePreset &&
            activePreset.global.map((group) => (
              <React.Fragment key={group.id}>
                <div className="md-text white-50">{group.title}</div>
                {group.params.map((param) => getParamRow(param, group, true))}
              </React.Fragment>
            ))}
        </div>

        {dialog && (
          <Dialog close={() => setDialog(false)}>
            <div className="title-text text-center">
              Congrats on getting your <br /> Jammy all set up!
            </div>
            <div>
              <a
                className="no-effect"
                href="https://playjammy.com/plugin/"
                target="_blank"
                rel="noreferrer"
              >
                <button style={{ width: '100%' }} className="btn btn-primary">
                  Finish onboarding and check the companion software
                </button>
              </a>
              <button
                className="btn btn-primary__outline"
                onClick={() => router.push('/support')}
              >
                I still have some questions, would like to contact support
              </button>
            </div>
          </Dialog>
        )}
      </div>
    </>
  )
})
export default Midi
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
