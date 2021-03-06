import { makeAutoObservable } from 'mobx'
import Store from './index'
import JammyGConfig from '../jammy-web-util/config/g/jammySettings_v1.8_fw19.json'
import JammyEConfig from '../jammy-web-util/config/e/jammySettings_v0.2.json'
import { sleep } from '../jammy-web-util/services/utils'
import { jammy } from './index'

import Clean_Picking_and_Strumming from '../jammy-web-util/config/presets/Clean Picking and Strumming.json'
import All_Techniques from '../jammy-web-util/config/presets/All Techniques.json'
import Super_Tapping from '../jammy-web-util/config/presets/Super Tapping.json'



class PresetsStore {
  config = JammyEConfig // TODO: Change logic for support Jammy G
  presets = [
    {
      id: 1,
      name: 'Clean Picking and Strumming',
      preset: Clean_Picking_and_Strumming,
    },
    {
      id: 2,
      name: 'All Techniques',
      preset: All_Techniques,
    },
    {
      id: 3,
      name: 'Super Tapping',
      preset: Super_Tapping,
    },
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
      await this.sendAllParamsRequest('setget', preset.preset)
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
    console.log("Send params: ", param.id, "from group:", param.group.groupId)
    for (let stringId = 0; stringId < param.values.length; stringId++) {
      const value = param.values[stringId]
      console.log("       String: ", value.string, " value: [", value.value, "]")

      jammy.sendParamRequest(op, {
        groupId: param.group.groupId,
        paramId: param.id,
        left: param.left,
        stringId: value.string,
        value: value.value,
      })
      await sleep(25)
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
    const currentString = string
    const value = param.values[currentString]
    console.log("Send param: ", param.id, "from group:", param.group.groupId)
    console.log("    String: ", currentString, " value: [", value, "]")
    jammy.sendParamRequest('setget', {
      groupId: group.groupId,
      paramId: param.id,
      stringId: currentString,
      left: param.left,
      value: value,
    })
    this.isFetch = false
  }
}

const store = new PresetsStore()
export default store
