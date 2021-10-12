import React, { useState, useReducer, Component } from 'react'
// import { FormGroup, CustomInput, Input } from 'reactstrap'
import { saveAs } from 'file-saver'
import Range from '../../components/Range'
import { Switch } from 'antd'
import { JAMMY_E, JAMMY_G } from '../services/jammy'
import { sleep } from '../services/utils'
import midi from '../services/midi'

import { midiService, jammy } from '../../store'
import PresetsStore from '../../store/PresetsStore'
const tmpDataJammyG = require('../config/g/jammySettings_v1.8_fw19.json')
const tmpDataJammyE = require('../config/e/jammySettings_v0.2.json')
const ruleData = require('../config/jammyRules_v2.0_fw20.json')

const strings = [1, 2, 3, 4, 5, 6]
const globalStrings = [1]
const globalString = 7

const SettingGroupParam = ({
  param,
  sendParamRequest,
  global,
  setActiveParam,
  isActive,
}) => {
  return (
    <div
      className={`presets-list__item ${isActive ? 'active' : ''}`}
      onClick={setActiveParam}
    >
      {param.name}
    </div>
  )
}

const SettingGroupParams = ({
  params = [],
  sendParamRequest,
  global,
  setActiveParam,
  isActive,
  activeParam,
}) => {
  return (
    <>
      {params.map((p, i) => (
        <SettingGroupParam
          param={p}
          key={p.id + (global ? 1000 : 1)}
          sendParamRequest={sendParamRequest}
          global={global}
          setActiveParam={() => setActiveParam(i)}
          isActive={isActive && i == activeParam}
        />
      ))}
    </>
  )
}

const SettingGroups = ({
  groups = [],
  sendParamRequest,
  global,
  setActiveParam,
  activeGroup,
  activeParam,
}) => {
  return (
    <>
      {groups.map((g, i) => (
        <SettingGroupParams
          key={g.id}
          params={g.params}
          sendParamRequest={sendParamRequest}
          global={global}
          isActive={i === activeGroup}
          activeParam={activeParam}
          setActiveParam={(p) => setActiveParam(i, p)}
        />
      ))}
    </>
  )
}

class Configurator extends Component {
  constructor(props) {
    super(props)
    console.log('config constructor')
    let config = this.preprocessConfig(props.config, props.preset)
    this.state = {
      data: config,
      active: config.groups[0].params[0],
      activeGroup: 0,
      activeParam: 0,
      // Versions
      lfw: undefined,
      lhw: undefined,
      rfw: undefined,
    }
    this.updateTimer = null
    this.inputFile = React.createRef()
    this.leftSerialReceivedCount = 0
    this.tuningSent = false
    // this.sendAllParamsRequest('get')
  }

  preprocessConfig = (data, preset) => {

    for (let g of data.groups) {
      for (let p of g.params) {
        p.group = g
        const foundGroup = preset.groups.find((e) => e.groupId === g.groupId)
        if (foundGroup) {
          const foundParam = foundGroup.params.find((e) => e.id == p.id)
          if (foundParam) {
            foundParam.values.forEach((e) => [
              p.values[e.string] = e.value
            ])
          }
        }
      }
    }
    // for (let g of data.global) {
    //   for (let p of g.params) {
    //     p.group = g
    //   }
    // }
    return data
  }

  componentDidMount() {
    // midiService.init().finally(() => {
    //   midiService.loadState()
    midiService.addEventListener('midimessage', this.onMidiMessage)
    //   this.forceUpdate()
    // })
  }

  componentWillUnmount() {
    midiService.removeEventListener('midimessage', this.onMidiMessage)
  }

  onMidiMessage = (event) => {
    if (jammy.api === JAMMY_G) {
      this.parseMidiMessageForG(event)
    } else if (jammy.api === JAMMY_E) {
      this.parseMidiMessageForE(event)
    }
  }

  parseMidiMessageForG(event) {
    if (event.data.length === 39) {
      if (event.data[5] === 0) {
        // Left part serial
        if (!this.tuningSent) {
          console.log(this.tuningSent, this.leftSerialReceivedCount)
          this.leftSerialReceivedCount++
          if (this.leftSerialReceivedCount > 10) {
            this.leftSerialReceivedCount = 0
            jammy.sendStandardTuning()
            this.tuningSent = true
          }
        }
      }

      const jammyData = jammy.unpackJammySysexForG(event.data)
      if (jammyData.length > 0) {
        switch (jammyData[0]) {
          case 7:
            // Diagnostics on start
            if (jammyData[7] === 0xf) {
              // Last part - we need to stop advertising by querying anything
              jammy.sendVersionsRequest()
            }
            break

          case 8:
            // Versions info
            console.log(
              `Versions - LEFT HW1: ${jammyData[1]}; LEFT HW2: ${jammyData[2]}; LEFT FW: ${jammyData[3]}; RIGHT FW: ${jammyData[8]};`
            )
            break
          case 9:
            // Right part info
            this.parseParamResponseFromG(jammyData, 7)
            break
          case 10:
            // Left part info
            this.parseParamResponseFromG(jammyData, 0)
            break
          default:
            break
        }
      }
    }

    if (event.data.length === 9) {
      this.parseTraceEvent(event.data, ruleData)
    }
  }

  parseMidiMessageForE(event) {
    const jammyData = event.data
    const stringId = jammyData[6]
    if (stringId !== 0x7e && stringId !== 0x7f) {
      if (stringId > 6) {
        console.warn('Invalid string number: ', stringId, 'data: ', jammyData)
        return
      }
      const groupId = jammyData[7]
      const paramId = jammyData[8]

      let p = this.findParam(groupId, paramId, stringId === 6)

      if (p) {
        let value = midi.to16BitInt(jammyData, 9)
        console.log(
          'Response ',
          groupId,
          'param = ',
          paramId,
          'for string = ',
          stringId,
          'value = ',
          value
        )
        p.values[stringId === 6 ? 0 : stringId] = value

        clearTimeout(this.updateTimer)
        this.updateTimer = setTimeout(() => this.forceUpdate(), 200)

        if (stringId === 6) {
          switch (groupId) {
            case 3: // FW Versions
              switch (paramId) {
                case 0: // Right part fw
                  console.log(`Versions - RIGHT FW: ${value}`)
                  this.setState({
                    rfw: value,
                  })
                  break
                case 1: // Left part fw
                  console.log(`Versions - LEFT FW: ${value}`)
                  this.setState({
                    lfw: value,
                  })
                  break
                case 2: // Left part hw
                  console.log(`Versions - LEFT HW: ${value}`)
                  this.setState({
                    lhw: value,
                  })
                  break
                default:
                  break
              }
              break
            default:
              break
          }
        }
      } else {
        console.warn('param not found', p, 'data: ', jammyData)
      }
    }
  }

  parseTraceEvent = (jammyData, ruleData) => {
    const channel = jammyData[4] & 0x0f
    const type = (jammyData[4] >> 4) & 0x0f
    const desc = jammyData[5]
    console.log(
      `Trace - String ${channel}; ${ruleData.eventTypes[type].name}; ${ruleData.eventDescs[desc].name}`
    )
  }

  findParam = (groupId, paramId, global) => {
    let data = global ? this.state.data.global : this.state.data.groups
    for (let i = 0; i < data.length; i++) {
      if (data[i].groupId === groupId) {
        let g = data[i]
        for (let j = 0; j < g.params.length; j++) {
          if (g.params[j].id === paramId) {
            return g.params[j]
          }
        }
        break
      }
    }
    return null
  }

  parseParamResponseFromG = (jammyData, offset) => {
    const stringId = jammyData[1 + offset]
    if (stringId !== 0x7e && stringId !== 0x7f) {
      if (stringId > 6) {
        console.warn('Invalid string number: ', stringId, 'data: ', jammyData)
        return
      }

      let p = this.findParam(
        jammyData[2 + offset],
        jammyData[3 + offset],
        stringId === 6
      )

      if (p) {
        let value = (jammyData[4 + offset] << 8) + jammyData[5 + offset]
        p.values[stringId === 6 ? 0 : stringId] = value

        clearTimeout(this.updateTimer)
        this.updateTimer = setTimeout(() => this.forceUpdate(), 200)
      } else {
        console.warn('param not found', p, 'data: ', jammyData)
      }
    }
  }

  sendParamRequest = async (op, param) => {
    for (let stringId = 0; stringId < param.values.length; stringId++) {
      // console.log(new Date(), param, stringId);
      jammy.sendParamRequest(op, {
        groupId: param.group.groupId,
        paramId: param.id,
        left: param.left,
        stringId,
        value: param.values[stringId],
      })
      await sleep(20)
    }
  }

  sendGlobalParamRequest = async (op, param) => {
    jammy.sendParamRequest(op, {
      groupId: param.group.groupId,
      paramId: param.id,
      left: param.left,
      stringId: 6,
      value: param.values[0],
    })
    await sleep(10)
  }

  sendAllParamsRequest = async (op) => {
    for (let g of this.state.data.groups) {
      for (let p of g.params) {
        await this.sendParamRequest(op, p)
        // break;
      }
      // break;
    }

    for (let g of this.state.data.global) {
      for (let p of g.params) {
        await this.sendParamRequest(op, p)
        // break;
      }
      // break;
    }
  }

  getSettingsAsJson = () => {
    const exp = { ...this.state.data }
    exp.groups = []

    for (let g of this.state.data.groups) {
      let newG = { ...g }
      newG.params = []

      for (let p of g.params) {
        let newP = { ...p }
        delete newP.group
        newG.params.push(newP)
      }

      exp.groups.push(newG)
    }

    exp.global = []

    for (let gl of this.state.data.global) {
      let newG = { ...gl }
      newG.params = []

      for (let p of gl.params) {
        let newP = { ...p }
        delete newP.group
        newG.params.push(newP)
      }

      exp.global.push(newG)
    }

    return exp
  }

  getPresetAsJson = () => {
    const settings = this.getSettingsAsJson()
    const preset = {}

    preset.version = null
    preset.id = null
    preset.name = null
    preset.description = null
    preset.left = settings.left
    preset.right = settings.right
    preset.groups = []
    preset.global = []

    function convert(sg, groups, global) {
      const params = []
      sg.params.forEach((sp) => {
        const values = []

        for (let i = 0; i < sp.values.length; i++) {
          if (sp.values[i] !== sp.default[i]) {
            values.push({ string: global ? 6 : i, value: sp.values[i] })
          }
        }

        if (values.length > 0) {
          params.push({ id: sp.id, left: sp.left, values })
        }
      })

      if (params.length > 0) {
        groups.push({ groupId: sg.groupId, params })
      }
    }

    settings.groups.forEach((sg) => {
      convert(sg, preset.groups, false)
    })

    settings.global.forEach((sg) => {
      convert(sg, preset.global, true)
    })

    return preset
  }

  saveSettings = () => {
    const data = this.getSettingsAsJson()

    var json = JSON.stringify(data, null, 2)

    console.log('JSON: ' + json)

    var blob = new Blob([json], {
      type: 'application/json',
    })

    saveAs(blob, 'jammy_settings.json')
  }

  loadSettings = () => {
    this.inputFile.current.click()
  }

  setAsDefault = () => {
    for (let g of this.state.data.groups) {
      for (let p of g.params) {
        p.default = [...p.values]
      }
    }

    this.forceUpdate()
  }

  savePreset = () => {
    const data = this.getPresetAsJson()

    var blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })

    saveAs(blob, 'jammy_preset.json')
  }

  onFileChanged = async () => {
    if (this.inputFile.current.files.length === 0) return
    const file = this.inputFile.current.files[0]
    const ext = file.name.substr(file.name.lastIndexOf('.') + 1).toLowerCase()

    console.log(file.name, file.type)

    switch (ext) {
      case 'json':
        try {
          const text = await file.text()
          const data = JSON.parse(text)
          this.setState({ data: this.preprocessConfig(data) })
        } catch (ex) {
          console.error(ex)
          alert('Failed to load file')
        }
        break
      default:
        alert('Unsupported format ' + ext)
    }

    this.inputFile.current.value = ''
  }

  onRangeChange(v, string) {
    let data = this.state.data
    data.groups[this.state.activeGroup].params[this.state.activeParam].values[
      string
    ] = v
    PresetsStore.saveParamChange(
      data.groups[this.state.activeGroup],
      data.groups[this.state.activeGroup].params[this.state.activeParam],
      string
    )
    this.setState({ data })
  }

  onSetActiveParam(g, p) {
    const param = this.state.data.groups[g].params[p]
    console.log('Activate param: ', p, " from group: ", g)
    this.setState({
      active: param,
      activeGroup: g,
      activeParam: p,
    })
  }

  positiveValue(param) {
    if (param.reversed) {
      return param.min;
    } else {
      return param.max;
    }
  }

  negativeValue(param) {
    if (param.reversed) {
      return param.max;
    } else {
      return param.min;
    }
  }

  render() {
    return (
      <div className="presets-customize">
        <div className="title-text text-center">Customize the playability</div>
        <div className="md-text text-center">
          Based on “{this.props.presetName || 'Default'}” preset
        </div>
        <div className="presets-customize__inner">
          <div className="presets-list">
            <SettingGroups
              groups={this.state.data.groups}
              sendParamRequest={this.sendParamRequest}
              global={false}
              activeGroup={this.state.activeGroup}
              activeParam={this.state.activeParam}
              setActiveParam={(g, p) => {
                console.log("Click!")
                this.onSetActiveParam(g, p)
              }}
            />
          </div>
          {this.state.active && (
            <div className="presets-side-card">
              <button
                className="presets-side-card__btn"
                onClick={() => {
                  this.state.active.default.map((el, i) => {
                    this.onRangeChange(el, i)
                  })
                }}
              >
                Restore to default settings
              </button>
              {[
                'String 1 (high E)',
                'String 2 (B)',
                'String 3 (G)',
                'String 4 (D)',
                'String 5 (A)',
                'String 6 (low E)',
              ].map((string, index) => {
                if (this.state.active.type === 'MASK') {
                  return <div className="switch-wrapper" key={index}>
                    <div className="md-text">{string}</div>
                    <Switch
                      defaultChecked={this.state.active.values[index] === 16383}
                      onChange={(v) => this.onRangeChange(v ? 16383 : 0, index)}
                    />
                  </div>
                } else
                  if (this.state.active.type === 'BOOL') {
                    console.log("Params: ", this.state.active.values[index])
                    return <div className="switch-wrapper" key={
                      this.state.active.id * 10000 + this.state.active.group.groupId * 1000 + this.state.active.id * 100 + index * 10 + this.state.active.values[index]
                    }>
                      <div className="md-text">{string}</div>
                      <Switch
                        defaultChecked={this.state.active.values[index] === this.positiveValue(this.state.active)}
                        onChange={(v) => this.onRangeChange(v ? this.positiveValue(this.state.active) : this.negativeValue(this.state.active), index)}
                      />
                    </div>
                  } else {
                    return <Range
                      key={index}
                      label={string}
                      value={this.state.active.values[index]}
                      min={this.state.active.min}
                      max={this.state.active.max}
                      onChange={(v) => {
                        let { min, max } = this.state.active
                        if (v !== min && v !== max) this.onRangeChange(v, index)
                      }}
                    />
                  }
              })}
            </div>
          )}
        </div>
      </div>
    )
  }
}

const ConfiguratorG = (props) => {
  return <Configurator config={props.config} preset={props.preset} presetName={props.presetName} />
}

const ConfiguratorE = (props) => {
  return <Configurator config={props.config} preset={props.preset} presetName={props.presetName} />
}

export { ConfiguratorE, ConfiguratorG }
