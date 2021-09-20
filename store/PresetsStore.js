import { makeAutoObservable } from 'mobx'
import Store from './index'
import JammyGPreset from '../jammy-web-util/config/g/jammySettings_v1.8_fw19.json'
import JammyEPreset from '../jammy-web-util/config/e/jammySettings_v0.1.json'
import { sleep } from '../jammy-web-util/services/utils'
import { jammy } from './index'

import Clean_Picking_and_Strumming from '../jammy-web-util/config/presets/Clean Picking and Strumming.json'
import DefaultPreset from '../jammy-web-util/config/presets/Default.json'
import Rock_n_Roll from "../jammy-web-util/config/presets/Rock'n'Roll.json"
import Shredding from '../jammy-web-util/config/presets/Shredding.json'
import Tapping from '../jammy-web-util/config/presets/Tapping.json'
import Tapping_Dampened_Strings from '../jammy-web-util/config/presets/Tapping (Dampened Strings).json'
import Increased_Picking_Sensitivity from '../jammy-web-util/config/presets/Increased Picking Sensitivity.json'
import Increased_Tapping_Sensitivity from '../jammy-web-util/config/presets/Increased Tapping Sensitivity.json'
import Increased_Right_Hand_Muting_Sensitivity from '../jammy-web-util/config/presets/Increased Right Hand Muting Sensitivity.json'
import Increased_Left_Hand_Muting_Sensitivity from '../jammy-web-util/config/presets/Increased Left Hand Muting Sensitivity.json'
import Troubleshoot_Self_Muting_Strings from '../jammy-web-util/config/presets/Troubleshoot Self-Muting Strings.json'
import Troubleshoot_Tapping from '../jammy-web-util/config/presets/Troubleshoot Tapping.json'
class PresetsStore {
  presets = [
    {
      id: 1,
      name: 'Clean Picking and Strumming',
      preset: Clean_Picking_and_Strumming,
    },
    { id: 2, name: 'Default (All Techniques)	', preset: DefaultPreset },
    { id: 3, name: 'Rock’n’Roll', preset: Rock_n_Roll },
    { id: 4, name: 'Shredding', preset: Shredding },
    { id: 5, name: 'Tapping', preset: Tapping },
    {
      id: 6,
      name: 'Tapping (Dampened Strings)',
      preset: Tapping_Dampened_Strings,
    },
    {
      id: 7,
      name: 'Increased Picking Sensitivity',
      preset: Increased_Picking_Sensitivity,
    },
    {
      id: 8,
      name: 'Increased Tapping Sensitivity ',
      preset: Increased_Tapping_Sensitivity,
    },
    {
      id: 9,
      name: 'Increased Right Hand Muting Sensitivity',
      preset: Increased_Right_Hand_Muting_Sensitivity,
    },
    {
      id: 10,
      name: 'Increased Left Hand Muting Sensitivity',
      preset: Increased_Left_Hand_Muting_Sensitivity,
    },
    {
      id: 11,
      name: 'Troubleshoot Self-Muting Strings',
      preset: Troubleshoot_Self_Muting_Strings,
    },
    { id: 12, name: 'Troubleshoot Tapping', preset: Troubleshoot_Tapping },
  ]
  isFetch = false
  activePreset = null
  customizedPreset = null
  isCustomize = false

  constructor() {
    makeAutoObservable(this)
  }
  setCustomizedPreset = (preset) => {
    if (!preset) {
      this.isCustomize = false
    } else {
      this.isCustomize = true
      this.customizedPreset = JSON.parse(JSON.stringify(preset))
    }
  }
  setActivePreset = async (preset, isCustom) => {
    if (
      (!this.activePreset && isCustom) ||
      (this.activePreset && this.activePreset.id === preset.id)
    )
      return
    this.isFetch = true
    if (preset) {
      this.activePreset = isCustom ? null : Object.assign({}, preset)
      await this.sendAllParamsRequest('set', preset.preset)
    } else {
      this.activePreset = null
    }
    this.isFetch = false
  }
  applyPreset = async (preset) => {
    this.isCustomize = false
    this.activePreset = null
    // this.isFetch = true
    // let newPreset = preset?.preset
    //   ? preset.preset
    //   : this.customizedPreset.preset
    // await this.sendAllParamsRequest('set', newPreset, Store.jammy)
    // this.isFetch = false
  }
  sendParamRequest = async (op, param) => {
    for (let stringId = 0; stringId < param.values.length; stringId++) {
      jammy.sendParamRequest(op, {
        groupId: param.group.groupId,
        paramId: param.id,
        left: param.left,
        stringId,
        value: param.values[stringId],
      })
      await sleep(10)
    }
  }

  sendAllParamsRequest = async (op, preset) => {
    if (!preset) preset = DefaultPreset
    for (let g of preset.groups) {
      for (let p of g.params) {
        try {
          await this.sendParamRequest(op, { ...p, group: g })
        } catch (error) {
          console.log(error)
        }
      }
    }
  }
  saveParamChange = async (group, param, string) => {
    this.isFetch = true
    await this.sendParamRequest('set', { ...param, group: group })
    // jammy.sendParamRequest('set', {
    //   groupId: group.groupId,
    //   paramId: param.id,
    //   left: param.left,
    //   string,
    //   value: param.values[string],
    // })
    // await sleep(100)
    // debugger
    // jammy.sendParamRequest('get', {
    //   groupId: group.groupId,
    //   paramId: param.id,
    //   left: param.left,
    //   string,
    //   value: param.values[string],
    // })
    this.isFetch = false
  }
}

const store = new PresetsStore()
export default store
