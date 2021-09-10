import { makeAutoObservable } from 'mobx'
import MidiPresets from './MidiPresets'
import { jammy } from './index'
import { sleep } from '../jammy-web-util/services/utils'
class MidiPresetsStore {
  SOFTWARES = [
    {
      id: 1,
      name: 'Ableton Live',
      url: '/softwares/ableton.png',
      preset: MidiPresets.ABLETON_INSTANT,
    },
    {
      id: 2,
      name: 'Logic Pro X ',
      url: '/softwares/logic-pro.png',
      preset: MidiPresets.LOGIC_PRO,
    },
    {
      id: 3,
      name: 'GarageBand',
      url: '/softwares/garage-band.png',
      preset: MidiPresets.GARAGE_BAND,
    },
    {
      id: 4,
      name: 'FL Studio ',
      url: '/softwares/fl-studio.png',
      preset: MidiPresets.DEFAULT_MIDI_PRESET,
    },
    {
      id: 5,
      name: 'Guitar Pro	',
      url: '/softwares/guitar-pro.png',
      preset: MidiPresets.GUITAR_PRO,
    },
    {
      id: 6,
      name: "I'd like to learn MIDI basics first ",
      url: '/softwares/default.png',
      preset: MidiPresets.DEFAULT_MIDI_PRESET,
    },
  ]
  activePreset = null
  constructor() {
    makeAutoObservable(this)
  }

  setActivePreset(soft) {
    this.activePreset = soft.preset
  }
  changePresetValue = async (param, group, value) => {
    let gIndex = this.activePreset.groups.findIndex((g) => g.id === group.id)
    let pIndex = this.activePreset.groups[gIndex].params.findIndex(
      (p) => p.id === param.id
    )
    let string = 6
    if (value.value) {
      string = value.string
      value = value.value
    }
    console.log(gIndex, pIndex, value)
    if (param.type === 'ARRAY') {
      for (let i = 0; i < 6; i++) {
        jammy.sendParamRequest('set', {
          groupId: group.groupId,
          paramId: param.id,
          left: param.left,
          stringId: i,
          value:
            string === i
              ? value
              : this.activePreset.groups[gIndex].params[pIndex].value,
        })
        await sleep(10)
      }
      this.activePreset.groups[gIndex].params[pIndex].value[string] = value
    } else {
      jammy.sendParamRequest('set', {
        groupId: group.groupId,
        paramId: param.id,
        left: param.part === 'left',
        stringId: string,
        value: value,
      })

      await sleep(10)
      this.activePreset.groups[gIndex].params[pIndex].value = value
    }
    this.activePreset = { ...this.activePreset }
  }
}

const store = new MidiPresetsStore()
export default store
