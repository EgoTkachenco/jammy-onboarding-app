import { makeAutoObservable } from 'mobx'
import MidiPresets from './MidiPresets'
import { jammy } from './index'
import { sleep } from '../jammy-web-util/services/utils'

import Config from '../jammy-web-util/config/e/jammyMidi_v0.1.json'


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
      name: "I’d like to configure MIDI myself",
      url: '/softwares/default.png',
      preset: Default,
    },
  ]
  activePreset = null
  constructor() {
    makeAutoObservable(this)
  }

  prepareConfig(preset) {

    var data = Config

    for (var i = 0; i < preset.groups.length; i++) {
      var gr = preset.groups[i]
      for (var j = 0; j < gr.params.length; j++) {
        var pr = gr.params[j]
        var foundGroup = data.groups.find(g => g.groupId === gr.groupId)
        if (foundGroup) {
          var foundParam = foundGroup.params.find(p => p.id === pr.id)
          if (foundParam) {
            for (var k = 0; k < pr.values.length; k++) {
              var vl = pr.values[k]
              foundParam.values[vl.string] = vl.value
            }
          }
        };
      }
    }

    for (var i = 0; i < preset.global.length; i++) {
      var gr = preset.global[i]
      for (var j = 0; j < gr.params.length; j++) {
        var pr = gr.params[j]
        var foundGroup = data.global.find(g => g.groupId === gr.groupId)
        if (foundGroup) {
          var foundParam = foundGroup.params.find(p => p.id === pr.id)
          if (foundParam) {
            var vl = pr.values[0]
            foundParam.values[0] = vl.value
          }
        };
      }
    }

    return data
  }

  setActivePreset(soft) {
    this.activePreset = this.prepareConfig(soft.preset)

    console.log("Current preset: ", JSON.stringify(this.activePreset))

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
    for (var i = 0; i < param.values.length; i++) {
      var e = param.values[i]
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

  changePresetValue = async (param, group, value, global) => {

    let string = 6
    if (value.value) {
      string = value.string
      value = value.value
    }
    
    if (!global) {
      let gIndex = this.activePreset.groups.findIndex((g) => g.id === group.id)
      let pIndex = this.activePreset.groups[gIndex].params.findIndex(
        (p) => p.id === param.id
      )
      console.log(gIndex, pIndex, value)
      for (let i = 0; i < 6; i++) {
        jammy.sendParamRequest('setget', {
          groupId: group.groupId,
          paramId: param.id,
          left: param.left,
          stringId: i,
          value:
            string === i
              ? value
              : this.activePreset.groups[gIndex].params[pIndex].values[i],
        })
        await sleep(20)
      }
      this.activePreset.groups[gIndex].params[pIndex].values[string] = value
    } else {
      let gIndex = this.activePreset.global.findIndex((g) => g.id === group.id)
      let pIndex = this.activePreset.global[gIndex].params.findIndex(
        (p) => p.id === param.id
      )
      jammy.sendParamRequest('setget', {
        groupId: group.groupId,
        paramId: param.id,
        left: param.part,
        stringId: 6,
        value: value,
      })
      await sleep(20)
      this.activePreset.global[gIndex].params[pIndex].values[0] = value
    }
    this.activePreset = { ...this.activePreset }
  }
}

const store = new MidiPresetsStore()
export default store
