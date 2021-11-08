import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Stepper from '../Stepper'
import Dialog from '../Dialog'
import Select from '../Select'
import Range from '../Range'
import { observer } from 'mobx-react-lite'
import { Switch } from 'antd'
import MidiPresetsStore from '../../store/MidiPresetsStore'
import InfoBtn from '../InfoBtn'

const Midi = observer(() => {
  const router = useRouter()
  const [dialog, setDialog] = useState(false)
  const [isOnboardingDone, setIsOnboardingDone] = useState(false);
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
              param.options.find((option) => option.id === param.values[0])
                ?.name || null
            }
            options={param.options}
            getOption={(option) => option.name}
            onChange={(v) => onChange(param, group, v.id, global)}
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
    return Array.apply(0, Array(end - 1)).map((element, index) => index + start)
  }

  const getParamRow = (param, group, global) => {
    if (!global) {
      return (
        <>
          {[0, 1, 2, 3, 4, 5].map((string) => (
            <div className="midi-list__item" key={string}>
              <div className="midi-list__item__label">String {string + 1}</div>
              <div className="midi-list__item__input">
                <Select
                  value={param.name + ' ' + param.values[string]}
                  options={range(param.min, param.max)}
                  getOption={(option) => param.name + ' ' + option}
                  onChange={(v) =>
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
  var result = ''
  for (var i = 33; i < 127; i++) {
    result += i + ', '
  }
  console.log(result)

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
                <div className="md-text white-50">
                  <span>{group.title}</span>
                  <InfoBtn info={getSettingInfo(group.title)} />
                </div>
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
          <Dialog hasTransparency={!isOnboardingDone} close={!isOnboardingDone && (() => setDialog(false))}>
            <div className="title-text text-center pre-wrap">
              { isOnboardingDone ? 'Enjoy your Jammy!' : 'Congrats on getting your \n Jammy all set up!' }
            </div>
            { !isOnboardingDone && <div className="d-flex flex-column">
              {/* <a
                className="no-effect"
                href="https://playjammy.com/plugin/"
                target="_blank"
                rel="noreferrer"
              >
                <button style={{ width: '100%' }} className="btn btn-primary">
                  Finish onboarding and check the companion software
                </button>
              </a> */}

              <button
                className="btn btn-primary"
                onClick={() => setIsOnboardingDone(true)}
              >
                Finish onboarding
              </button>

              <button
                className="btn btn-primary__outline"
                onClick={() => router.push('/support')}
              >
                I still have some questions, would like to contact support
              </button>
            </div> }
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

const getSettingInfo = (name) => {
  switch (name) {
    case 'MIDI Channels':
      return (
        <>
          Jammy sends the notes from each string into a separate MIDI channel,
          allowing you to split them between different virtual instruments or
          record tabs with accurate finger position information.
          <br />
          Note that if you set multiple strings to the same MIDI Channel,
          bending one of these strings will pitch-bend the notes played on the
          other strings, as well.
        </>
      )
    case 'String Bending':
      return (
        <>
          Controls whether string bending on Jammy will use the full range of
          the MIDI pitch wheel parameter or a fraction of it. This lets you
          adjust Jammy to the bending range of the software instrument that
          you’re playing.
          <br />
          If you’re playing a software instrument and it feels like the strings
          go out of tune very easily, or making a full-step bend sends the note
          much higher than expected, you likely need to adjust the Pitch Bending
          Range (Divide By) parameter. For example, guitar instruments in
          GarageBand and Logic Pro will play bends naturally when Jammy’s Pitch
          Bending Range is divided by 24.
        </>
      )
    case 'String Muting':
      return (
        <>
          Fret Hand Muting lets you choose what will happen if you’re picking a
          string while dampening it with your fretting hand. The default option
          is “Don’t play notes”, so Jammy will not send any MIDI notes in this
          situation. If you choose “Play regular notes”, picking a dampened
          string will produce a MIDI note (determined by the last detected fret
          position before the string got dampened).
          <br />
          Palm Muting lets you trigger MIDI commands by palm muting the strings
          with your picking hand. You can choose from a number of modes:
          <ul>
            <li>- Off: No extra MIDI commands will be sent for palm muting.</li>
            <li>
              - MIDI CC: A continuous control parameter (determined by MIDI CC
              Number) will be set to maximum (127) every time you palm mute the
              strings and minimum (0) every time you release them.
            </li>
            <li>
              - Keyswitch: A MIDI note (determined by Primary Keyswitch) will
              start playing every time you palm mute the strings and stop
              playing every time you release them.
            </li>
            <li>
              - 2 Keyswitches: A MIDI note (determined by Primary Keyswitch)
              will be playing while you’re palm muting the strings and another
              MIDI note (Secondary Keyswitch) will play while you’re not palm
              muting.
            </li>
            <li>
              - MIDI CC and Keyswitch: The “MIDI CC” and “Keyswitch” modes will
              work at the same time.
            </li>
            <li>
              - MIDI CC and 2 Keyswitches: The “MIDI CC” and “2 Keyswitches”
              modes will work at the same time.
            </li>
          </ul>
          Palm muting is triggered when 4 or more strings are simultaneously
          touched by the picking hand.
        </>
      )
    case 'Accelerometer':
      return (
        <>
          Accelerometer Mode lets you choose how tilting the Jammy will control
          the MIDI parameter determined by MIDI CC Number:
          <ul>
            <li>- Off: Tilting the Jammy won’t control any parameters.</li>
            <li>
              - Up and Down: Tilting Jammy all the way up will set the MIDI CC
              parameter to the maximum, tilting it all the way down will set it
              to the minimum, returning to the normal position will set the
              parameter in the middle.
            </li>
            <li>
              - Up Only: Tilting Jammy all the way up will set the MIDI CC
              parameter to the maximum, returning to the normal position will
              set it to the minimum. Tilting down won’t affect the parameter.
            </li>
            <li>
              - Down Only: Tilting Jammy all the way down will set the MIDI CC
              parameter to the maximum, returning to the normal position will
              set it to the minimum. Tilting up won’t affect the parameter.
            </li>
          </ul>
          The normal position of the Accelerometer is set to 10 degrees above
          the horizon.
        </>
      )
    case 'Volume Knob':
      return (
        <>
          Volume Knob Press lets you trigger MIDI commands by pressing the
          Volume Knob. You can choose from a number of modes:
          <ul>
            <li>
              - Off: Pressing the Volume Knob won’t send any MIDI commands
            </li>
            <li>
              - MIDI CC Toggle: A continuous control parameter (determined by
              MIDI CC Number) will be set to maximum (127) when you press the
              Volume Knob once and return to minimum (0) when you press the
              Volume Knob for the second time.
            </li>
            <li>
              - MIDI CC Momentary: A continuous control parameter (determined by
              MIDI CC Number) will be set to maximum (127) while you press and
              hold the Volume Knob and will return to minimum (0) when you
              release it.
            </li>
            <li>
              - Keyswitch Toggle: A MIDI note (determined by Primary Keyswitch)
              will start playing when you press the Volume Knob once and stop
              playing when you press the Volume Knob for the second time.
            </li>
            <li>
              - Keyswitch Momentary: A MIDI note (determined by Primary
              Keyswitch) will start playing when you press the Volume Knob and
              stop playing when you release it.
            </li>
            <li>
              - 2 Keyswitches Toggle: A MIDI note (determined by Primary
              Keyswitch) will start playing when you press the Volume Knob once
              and stop playing when you press the Volume Knob for the second
              time. Another MIDI note (Secondary Keyswitch) will start playing
              on the second Volume Knob press and will be stopped by the next
              press.
            </li>
            <li>
              - 2 Keyswitches Momentary: A MIDI note (determined by Primary
              Keyswitch) will be playing while you’re holding down the Volume
              Knob and another MIDI note (Secondary Keyswitch) will play while
              the Volume Knob isn’t pressed.
            </li>
          </ul>
          Volume Knob Turn lets you control a MIDI CC parameter (determined by
          MIDI CC Number) by turning the Volume Knob. The parameter is initially
          set to Starting Value and every turn of the Volume Knob changes it by
          the Step amount.
        </>
      )
    case 'Advanced':
      return 'Turning on Playability Logging in MIDI will send additional SysEx messages in MIDI that help analyze note tracking and improve playability.'

    default:
      return null
  }
}
