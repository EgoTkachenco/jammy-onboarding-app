import { makeAutoObservable } from 'mobx'
import Store from './index'
import JammyGPreset from '../jammy-web-util/config/g/jammySettings_v1.8_fw19.json'
import JammyEPreset from '../jammy-web-util/config/e/jammySettings_v0.1.json'
import { sleep } from '../jammy-web-util/services/utils'
class PresetsStore {
  presets = [
    { id: 1, name: 'Clean Picking and Strumming' },
    { id: 2, name: 'Default (All Techniques)	' },
    { id: 3, name: 'Rock’n’Roll' },
    { id: 4, name: 'Shredding' },
    { id: 5, name: 'Tapping' },
    { id: 6, name: 'Tapping (Dampened Strings)' },
    { id: 7, name: 'Increased Picking Sensitivity' },
    { id: 8, name: 'Increased Tapping Sensitivity ' },
    {
      id: 9,
      name: 'Increased Right Hand Muting Sensitivity',
    },
    {
      id: 10,
      name: 'Increased Left Hand Muting Sensitivity',
    },
    { id: 11, name: 'Troubleshoot Self-Muting Strings' },
    { id: 12, name: 'Troubleshoot Tapping' },
  ]
  isCustomize = false
  activePreset = null
  customizedPreset = null
  isFetch = false

  constructor() {
    makeAutoObservable(this)
  }

  setActivePreset = (preset, isCustom = false) => {
    this.activePreset = {
      ...preset,
      preset: isCustom ? preset.preset : JammyGPreset,
    }
    this.isCustomize = true
    this.customizedPreset = this.activePreset
  }
  applyPreset = async (preset) => {
    debugger
    this.isCustomize = false

    this.activePreset = null
    this.isFetch = true
    let newPreset = preset ? JammyGPreset : this.customizedPreset.preset
    await sendAllParamsRequest('set', newPreset, Store.jammy)
    this.isFetch = false
  }
}

const store = new PresetsStore()
export default store

const sendParamRequest = async (op, param, jammy) => {
  for (let stringId = 0; stringId < param.values.length; stringId++) {
    // console.log(new Date(), param, stringId);
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

const sendAllParamsRequest = async (op, preset, jammy) => {
  for (let g of preset.groups) {
    for (let p of g.params) {
      try {
        await sendParamRequest(op, p, jammy)
      } catch (error) {
        console.log(error)
        debugger
      }
    }
  }
}
