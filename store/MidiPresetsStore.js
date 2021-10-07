import { makeAutoObservable } from 'mobx'
import MidiPresets from './MidiPresets'
import { jammy } from './index'
import { sleep } from '../jammy-web-util/services/utils'

import Default from '../jammy-web-util/config/midi/Default.json'
import GarageBand_Guitar_and_Bass from '../jammy-web-util/config/midi/GarageBand (Guitar and Bass).json'
import Guitar_Pro from '../jammy-web-util/config/midi/Guitar Pro.json'


class MidiPresetsStore {
  SOFTWARES = [
    {
      id: 1,
      name: 'Ableton Live',
      url: '/softwares/ableton.png',
      preset: Default,
    },
    {
      id: 2,
      name: 'Logic Pro X (Guitar and Bass)',
      url: '/softwares/logic-pro.png',
      preset: GarageBand_Guitar_and_Bass,
    },
    {
      id: 21,
      name: 'Logic Pro X (Non-Guitar Instruments)',
      url: '/softwares/logic-pro.png',
      preset: Default,
    },
    {
      id: 3,
      name: 'GarageBand (Guitar and Bass)',
      url: '/softwares/garage-band.png',
      preset: GarageBand_Guitar_and_Bass,
    },
    {
      id: 31,
      name: 'GarageBand (Non-Guitar Instruments)',
      url: '/softwares/garage-band.png',
      preset: Default,
    },
    // {
    //   id: 4,
    //   name: 'FL Studio ',
    //   url: '/softwares/fl-studio.png',
    //   preset: MidiPresets.DEFAULT_MIDI_PRESET,
    // },
    {
      id: 5,
      name: 'Guitar Pro',
      url: '/softwares/guitar-pro.png',
      preset: Guitar_Pro,
    },
    {
      id: 6,
      name: "I'd like to learn MIDI basics first ",
      url: '/softwares/default.png',
      preset: Default,
    },
  ]
  activePreset = null
  constructor() {
    makeAutoObservable(this)
  }

  setActivePreset(soft) {
    this.activePreset = soft.preset

    this.processPreset(soft).then(() => {
      // Ignore
    });
  }

  processPreset = async (soft) => {

    for (var i = 0; i < soft.preset.groups.length; i++) {
      var gr = soft.preset.groups[i]
      for (var j = 0; j < gr.params.length; j++) {
        var p = gr.params[j]
        await this.sendParamRequest('setget', p, gr)
      };
    }

    for (var i = 0; i < soft.preset.global.length; i++) {
      var gr = soft.preset.global[i]
      for (var j = 0; j < gr.params.length; j++) {
        var p = gr.params[j]
        await this.sendParamRequest('setget', p, gr)
      };
    }
  }

  sendParamRequest = async (op, param, group) => {
    for (var i = 0; i < soft.preset.global.length; i++) {
      var e = soft.preset.values[i]
      jammy.sendParamRequest(op, {
        groupId: group.groupId,
        paramId: param.id,
        left: param.left,
        stringId: e.string,
        value: e.value,
      })
      await sleep(50)
      console.log("Send param: ", param.id, "for string: ", e.string, "value: ", e.value)
    }

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
        jammy.sendParamRequest('setget', {
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
      jammy.sendParamRequest('setget', {
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
