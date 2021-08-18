import React, { useState, useReducer, Component } from 'react'
import { FormGroup, CustomInput, Input } from 'reactstrap'
import { saveAs } from 'file-saver'
import Range from '../../components/Range'
import midiService from '../services/midi'
import { JAMMY_E, JAMMY_G } from '../services/jammy'
import { sleep, xmlToJson } from '../services/utils'
import midi from '../services/midi'

let jammy
// const tmpData = require("../../config/jammySettings_v1.7.3_fw15.json");
const tmpDataJammyG = require('../config/g/jammySettings_v1.8_fw19.json')
const tmpDataJammyE = require('../config/e/jammySettings_v0.4.json')
const ruleData = require('../config/jammyRules_v2.0_fw20.json')

const strings = [1, 2, 3, 4, 5, 6]
const globalStrings = [1]
const globalString = 7

const MaskParamEditor = ({ param, string, global }) => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0)
  const [tmpText, setTmpText] = useState('')
  const [error, setError] = useState(false)

  const onCheckboxChanged = (bit, checked) => {
    setTmpText('')
    const mask = 1 << bit
    if (checked) {
      param.values[string] |= mask
    } else {
      param.values[string] &= ~mask
    }
    forceUpdate()
  }

  const onTextChange = (e) => {
    const v = Number(e.target.value)
    setTmpText(e.target.value)

    if (!isNaN(v) && v >= param.min && v <= param.max) {
      param.values[string] = v
      setError(false)
      forceUpdate()
    } else {
      setError(true)
    }
  }

  const onKeyDown = (e) => {
    if (e.keyCode === 27) {
      e.stopPropagation()
      setTmpText('')
      setError(false)
    }
  }

  const onBlur = () => {
    setTmpText('')
  }

  const changed =
    parseInt(param.values[string]) !== parseInt(param.default[string])
  return (
    <FormGroup className="mb-0">
      <div className="d-flex align-items-center">
        <div className="mr-3" style={{ width: '2rem' }}>
          S{global ? globalString : string + 1}
        </div>
        <div
          className={
            'mr-3 text-info text-center small' +
            (changed ? ' border border-warning' : '')
          }
          style={{ width: '3rem' }}
        >
          {param['default'][string]}
        </div>

        <div className="mr-3 text-primary" style={{ width: '6rem' }}>
          <Input
            className="text-center"
            value={tmpText || param.values[string]}
            onChange={onTextChange}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            invalid={error}
          />
        </div>
        <div className="flex-fill d-flex justify-content-between align-items-center">
          {Array(14)
            .fill(0)
            .map((_, i) => {
              return (
                <div
                  key={i}
                  className="text-center m-1"
                  style={{ lineHeight: '100%' }}
                >
                  <div className="small">{i}</div>
                  <input
                    className="m-0 "
                    type="checkbox"
                    checked={param.values[string] & (1 << i)}
                    onChange={(e) => onCheckboxChanged(i, e.target.checked)}
                  />
                </div>
              )
            })}
        </div>
      </div>
    </FormGroup>
  )
}

function roundOf(n, p) {
  const n1 = n * Math.pow(10, p + 1)
  const n2 = Math.floor(n1 / 10)
  if (n1 >= n2 * 10 + 5) {
    return (n2 + 1) / Math.pow(10, p)
  }
  return n2 / Math.pow(10, p)
}

const RangeParamEditor = ({ param, string, global }) => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0)
  const [tmpText, setTmpText] = useState('')
  const [error, setError] = useState(false)

  // if (param.title.startsWith("First f"))
  //   console.log("rp", param.title, string, param.values, tmpText);

  const onRangeChange = (e) => {
    // console.log(e.target, e.target.value);
    setTmpText('')
    param.values[string] = parseFloat(e.target.value)
    forceUpdate()
  }

  const onBlur = () => {
    setTmpText('')
  }

  const onTextChange = (e) => {
    const v = Number(e.target.value)
    setTmpText(e.target.value)
    if (!isNaN(v) && v >= param.min && v <= param.max) {
      param.values[string] = v
      setError(false)
      forceUpdate()
    } else {
      setError(true)
    }
  }

  const onKeyDown = (e) => {
    if (e.keyCode === 27) {
      e.stopPropagation()
      setTmpText('')
      setError(false)
    }
  }

  const changed =
    parseInt(param.values[string]) !== parseInt(param.default[string])

  return (
    <FormGroup className="mb-0">
      <div className="d-flex align-items-center">
        <div className="" style={{ width: '2rem' }}>
          S{global ? globalString : string + 1}
        </div>
        <div
          className={
            'mr-3 text-info text-center small' +
            (changed ? ' border border-warning' : '')
          }
          style={{ width: '3rem' }}
        >
          {param['default'][string]}
        </div>
        <div className="mr-2 text-primary" style={{ width: '6rem' }}>
          <Input
            className="text-center"
            value={tmpText || param.values[string]}
            onChange={onTextChange}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            invalid={error}
          />
        </div>
        <div className="mr-2 text-primary" style={{ width: '4rem' }}>
          {param.type.toUpperCase() === 'FLOAT'
            ? '(' + roundOf(param.values[string] * 0.005, 3) + ')'
            : ''}
        </div>
        <div className="flex-fill d-flex justify-content-between align-items-center">
          <div className="text-muted mr-1 small">{param.min}</div>
          <CustomInput
            id={`input_p_${param.id}_s_${string}`}
            type="range"
            onChange={onRangeChange}
            min={param.min}
            max={param.max}
            value={param.values[string]}
          />
          <div className="text-muted ml-1 text-right small">{param.max}</div>
        </div>
      </div>
    </FormGroup>
  )
}

const SettingGroupParam = ({
  param,
  sendParamRequest,
  global,
  setActiveParam,
}) => {
  return (
    <div className="presets-list__item" onClick={setActiveParam}>
      {param.title}
    </div>
  )
}

const SettingGroupParams = ({
  params = [],
  sendParamRequest,
  global,
  setActiveParam,
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
}) => {
  return (
    <>
      {groups.map((g, i) => (
        <SettingGroupParams
          key={g.id}
          params={g.params}
          sendParamRequest={sendParamRequest}
          global={global}
          setActiveParam={(p) => setActiveParam(i, p)}
        />
      ))}
    </>
  )
}

class Configurator extends Component {
  constructor(props) {
    super(props)
    let pData = this.preprocessData(props.preset)
    this.state = {
      data: pData,
      active: pData.groups[0].params[0],
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

  preprocessData = (data) => {
    for (let g of data.groups) {
      for (let p of g.params) {
        p.group = g
      }
    }

    for (let g of data.global) {
      for (let p of g.params) {
        p.group = g
      }
    }
    return data
  }

  componentDidMount() {
    midiService.init().finally(() => {
      midiService.loadState()
      midiService.addEventListener('midimessage', this.onMidiMessage)

      this.forceUpdate()
    })
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
      await sleep(10)
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

  parseXml = (text) => {
    function int(v) {
      return parseInt(v)
    }

    const parser = new DOMParser().parseFromString(text, 'text/xml')
    const res = xmlToJson(parser)

    const root = res['Full_configuration']
    const out = {}
    if (!root) {
      alert('Invalid settigs XML')
    }

    // console.log(JSON.stringify(res));

    out.left = int(root['@attributes']['LeftPartFw'])
    out.right = int(root['@attributes']['RightPartFw'])
    out.groups = []
    out.global = []

    for (let i = 0; i <= 6; i++) {
      const string = root[`String_${i}`]
      if (string !== undefined) {
        const srcGroups = string['Group']
        for (let srcG of srcGroups) {
          // console.log("src", srcG);
          this.extractGroup(int, srcG, i, out)
        }
      }
    }
    // return ;
    return out
  }

  onFileChanged = async () => {
    if (this.inputFile.current.files.length === 0) return
    const file = this.inputFile.current.files[0]
    const ext = file.name.substr(file.name.lastIndexOf('.') + 1).toLowerCase()

    console.log(file.name, file.type)

    switch (ext) {
      case 'xml':
        const text = await file.text()
        // alert(".xml");
        try {
          const data = this.parseXml(text)
          this.setState({ data: this.preprocessData(data) })
        } catch (ex) {
          console.error(ex)
          alert('Failed to load file')
        }

        break
      case 'json':
        try {
          const text = await file.text()
          const data = JSON.parse(text)
          this.setState({ data: this.preprocessData(data) })
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

  extractGroup(int, srcG, i, out) {
    // console.log("Extract: " + JSON.stringify(srcG));

    const groupId = int(srcG['@attributes']['GroupId'])
    let g

    let srcParams = srcG['Parameter']
    if (!Array.isArray(srcParams)) {
      srcParams = [srcParams]
    }
    let isGlobalGroup = i === 6
    if (i === 0 || isGlobalGroup) {
      g = {}
      g.groupId = groupId
      g.title = (srcG['#text'] || []).find((x) => !!x) || ''
      g.params = []
      for (let srcP of srcParams) {
        let p = {
          id: int(srcP['@attributes']['id']),
          title: srcP['#text'],
          type: srcP['@attributes']['Type'].toUpperCase(),
          min: int(srcP['@attributes']['minValue']),
          max: int(srcP['@attributes']['maxValue']),
          left: srcP['@attributes']['isLeftPart'] === '1',
          all: srcP['@attributes']['isForAll'] === '1',
          enabled: srcP['@attributes']['isVisible'] === '1',
          reversed: srcP['@attributes']['isReverse'] === '1',
          name: srcP['@attributes']['UName'],
          description: srcP['@attributes']['UAnnotation'],
          default: isGlobalGroup ? Array(1) : Array(6),
          values: isGlobalGroup ? Array(1) : Array(6),
        }

        if (isGlobalGroup) {
          p.default[0] = int(srcP['@attributes']['CurrentValue'])
          p.values[0] = int(srcP['@attributes']['CurrentValue'])
        }

        g.params.push(p)
      }
      if (isGlobalGroup) {
        out.global.push(g)
      } else {
        out.groups.push(g)
      }
    } else {
      g = out.groups.find((x) => x.groupId === groupId)
    }
    if (!isGlobalGroup) {
      srcParams.forEach((srcP) => {
        let p = g.params.find((x) => x.id === int(srcP['@attributes']['id']))
        p.default[i] = int(srcP['@attributes']['CurrentValue'])
        p.values[i] = int(srcP['@attributes']['CurrentValue'])
      })
    }
  }
  onRangeChange(v, string) {
    let active = this.state.active
    active.values[string] = v
    let data = this.state.data
    data.groups[this.state.activeGroup].params[this.state.activeParam].values[
      string
    ] = v

    this.setState({ data, active })
  }
  onSetActiveParam(g, p) {
    debugger
    this.setState({
      active: this.state.data.groups[g].params[p],
      activeGroup: g,
      activeParam: p,
    })
  }
  render() {
    return (
      <div className="presets-customize">
        <div className="title-text text-center">Customize the playability</div>
        <div className="md-text text-center">
          {/* Based on “{preset?.name || 'Default'}” preset */}
          Based on Default preset
        </div>
        <div className="presets-customize__inner">
          <div className="presets-list">
            <SettingGroups
              groups={this.state.data.groups}
              sendParamRequest={this.sendParamRequest}
              global={false}
              setActiveParam={(g, p) => this.onSetActiveParam(g, p)}
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
              ].map((string, index) => (
                <Range
                  key={index}
                  label={string}
                  value={this.state.active.values[index]}
                  min={this.state.active.min}
                  max={this.state.active.max}
                  onChange={(v) => this.onRangeChange(v, index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }
}

const ConfiguratorG = (props) => {
  midiService.logIncoming = true
  midiService.logOutgoing = true
  jammy = props.jammy
  return <Configurator preset={props.preset} />
}

const ConfiguratorE = (props) => {
  midiService.logIncoming = true
  midiService.logOutgoing = true
  jammy = props.jammy
  return <Configurator preset={props.preset} />
}

export { ConfiguratorE, ConfiguratorG }
