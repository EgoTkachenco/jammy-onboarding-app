import meta from '../MetaInfo'
import { midiService as midi } from '../../store/'
import { sleep, crc16 } from './utils'

export const MAX_STRINGS = 6
export const MAX_FRETS = 15

export const JAMMY_G = 0
export const JAMMY_E = 1

const jammy = {}

jammy.api = JAMMY_G

// jammy.MIN_SUPPORTED_FW_VERSION = MIN_SUPPORTED_FW_VERSION;

jammy.tunings = {
  Standard: [40, 45, 50, 55, 59, 64].reverse(),
}

jammy.defaultTuning = 'Standard'
jammy.currentTuning = jammy.tunings[jammy.defaultTuning]
jammy.lastPlayedChannelNote = Array.from({ length: 16 }, () => -1)

// Send tuning
// [0] - first string, [5] - sixth string
jammy.sendTuning = function sendTuning(tuning) {
  if (tuning.length !== MAX_STRINGS) {
    throw new Error('Tuning object should have length 6')
  }

  const messageId = 0x51 //H_CONF_DATA
  const sysex = [
    0xf0,
    0x7f,
    0x02,
    0x06,
    messageId,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0xf7,
  ]

  sysex.splice(6, tuning.length, ...tuning)

  midi.sendMidiMessage(sysex)
}

jammy.sendStandardTuning = () => {
  jammy.sendTuning(jammy.tunings.Standard)
}

// Get tuning array from chord
// chord: x55450, first char is 6th string, last is 1st
jammy.getTuningFromChord = function (chord) {
  if (chord.length !== MAX_STRINGS) {
    throw Error('Chord should have only 6 chars')
  }

  let ch = chord.split('').reverse()
  let tuning = []

  for (let i = 0; i < MAX_STRINGS; i++) {
    let c = ch[i]
    let fret = parseInt(c)

    if (c === 'x' || isNaN(fret)) {
      tuning.push(0)
    } else {
      let t = jammy.currentTuning[i] + fret
      tuning.push(t)
    }
  }

  return tuning
}

jammy.initMetronome = function () {
  midi.sendMidiMessage([0xcf, 0x7e])
  midi.sendMidiMessage([0xbf, 0x07, 0x7f])
}

jammy.initStrings = function () {
  let volume =
    ((Number.parseInt(localStorage.getItem('stringsVolume')) || 100) * 127.0) /
    100.0
  for (let index = 1; index < 7; index++) {
    midi.sendMidiMessage([0xb0 + index, 0x07, volume])
  }
}

jammy.metronomeTick = function () {
  var note = 0x22
  switch (localStorage.getItem('alternativeMetronome')) {
    case 'first':
      note += 10
      break
    case 'second':
      note += 20
      break
    default:
      // Ignore
      break
  }
  midi.sendMidiMessage([0x9f, note, 0x7f])
}

jammy.metronomeTock = function () {
  var note = 0x21
  switch (localStorage.getItem('alternativeMetronome')) {
    case 'first':
      note += 10
      break
    case 'second':
      note += 20
      break
    default:
      // Ignore
      break
  }
  midi.sendMidiMessage([0x9f, note, 0x7f])
}

/**
 * @param {string|Array} chord - chord string in reverse order "022000" or array in direct order [0, 0, 0, 2, 2, 0]
 */
jammy.sendChord = function sendChord(chord, capo) {
  if (chord.length !== MAX_STRINGS) {
    throw Error('Chord should have only 6 chars')
  }

  let ch = null

  if (Array.isArray(chord)) {
    ch = chord
  } else {
    ch = chord.split('').reverse()
  }

  const messageId = 0x50 //H_TRIG_HANDLER
  const sysex = [
    0xf0,
    0x7f,
    0x02,
    0x06,
    messageId,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0xf7,
  ]

  const TOUCH_BIT = 0x20
  const stringState = []
  for (let i = 0; i < MAX_STRINGS; i++) {
    let c = ch[i]
    let fret = parseInt(c)

    if (c === 'x' || isNaN(fret)) {
      stringState.push(TOUCH_BIT)
    } else {
      var shift = 0
      if (capo) shift = capo
      stringState.push(fret + shift)
    }
  }

  sysex.splice(7, stringState.length, ...stringState)

  midi.sendMidiMessage(sysex)
}

jammy.sendCapo = function sendCapo(capo) {
  if (capo < 0 || capo > 14) {
    throw Error('Chord should have only 6 chars')
  }

  const messageId = 0x62 //H_CONF_DATA_CAPO
  const sysex = [
    0xf0,
    0x7f,
    0x02,
    0x06,
    messageId,
    capo,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0xf7,
  ]

  midi.sendMidiMessage(sysex)
}

jammy.setEasyChordMode = function (enable) {
  const messageId = 0x68 //SENSITIVTY_SETTING
  const sysex = [
    0xf0,
    0x7f,
    0x02,
    0x06,
    messageId,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x01, // SET
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0xf7,
  ]

  // sysex[5] = stringId;
  // sysex[6] = groupId;
  // sysex[7] = paramId;
  // sysex[8] = data0;
  // sysex[9] = data1;
  // sysex[10] = leftPart ? 0x01 : 0x00;

  const params = [0, 6, 0, 0, !!enable ? 1 : 0, 0x01]

  sysex.splice(5, params.length, ...params)

  for (let i = 0; i < MAX_STRINGS; i++) {
    sysex[5] = i
    midi.sendMidiMessage(sysex)
  }
}

jammy.MetaCommand = {
  NAME: 0x01,
  SERIAL: 0x02,
  FIRMWARE: 0x03,
  SOUNDBANK: 0x04,
  BATTERY_LEVEL: 0x05,
  LEARNING_MODE: 0x06,

  ERROR: 0xc0,
  SUCCESS: 0xc1,
}

jammy.MetaError = {
  COMMAND_NOT_SUPPORTED: 0x01,
}

/** Send meta request to jammy
 @command - one from supported commands:
            NAME = 0x01 - Jammy name (BT or Hotspot), "Jammy-123"
            SERIAL = 0x02 - Serial number string, "123456ABCDEF"
            FIRMWARE = 0x03 - Firmware version string, "1.2.3"
            SOUNDBANK = 0x04 - Soundbank version string, "1.2"
            BATTERY_LEVEL = 0x05 - Special case omly one symbol, whihch contains value from 0 to 100
            ERROR = 0xC0 - Error with error code:         
                     COMMAND_NOT_SUPPORTED = 0x01
 @return request result in Promise
 @throws Error
*/

jammy.sendMetaRequest = function (command, data = undefined) {
  const messageId = 0x70 // META_CONFIG_REQUES
  const sysex = [0xf0, 0x7f, 0x02, 0x06, messageId, command, 0xf7]

  if (data !== undefined && Array.isArray(data)) {
    sysex.splice(6, 0, ...data)
  }

  return new Promise((resolve, reject) => {
    let timeOut = setTimeout(() => {
      midi.removeEventListener('midimessage', metaDataEventCallback)
      reject('Timeout occured when requesting guitar info')
    }, 1500)
    let metaDataEventCallback = async (event) => {
      let handledData = await jammy.handleMetaData(event)
      if (handledData.command === command) {
        clearTimeout(timeOut)
        midi.removeEventListener('midimessage', metaDataEventCallback)
        resolve({ message: handledData.message, data: handledData.data })
      }
    }
    midi.addEventListener('midimessage', metaDataEventCallback)
    midi.sendMidiMessage(sysex)
  })
}

/**
 * @returns device name or undefined
 */
jammy.getName = async function () {
  try {
    return (await jammy.sendMetaRequest(jammy.MetaCommand.NAME)).message
  } catch (error) {
    return undefined
  }
}

/**
 * @returns serial number or undefined
 */
jammy.getSerial = async function () {
  try {
    return (await jammy.sendMetaRequest(jammy.MetaCommand.SERIAL)).message
  } catch (error) {
    return undefined
  }
}

/**
 * @returns firmware version or undefined
 */
jammy.getFirmware = async function () {
  try {
    return (await jammy.sendMetaRequest(jammy.MetaCommand.FIRMWARE)).message
  } catch (error) {
    return undefined
  }
}
/**
 * @returns soundbank version or undefined
 */
jammy.getSoundbank = async function () {
  try {
    return (await jammy.sendMetaRequest(jammy.MetaCommand.SOUNDBANK)).message
  } catch (error) {
    return undefined
  }
}

/**
 * @returns battery level value or undefined
 */
jammy.getBatteryLevel = async function () {
  try {
    return (await jammy.sendMetaRequest(jammy.MetaCommand.BATTERY_LEVEL))
      .data[0]
  } catch (error) {
    return undefined
  }
}

/**
 * Enable/disable Jammy learning mode
 * @returns status
 */
jammy.enableLearningMode = async function (enable) {
  try {
    return (
      (
        await jammy.sendMetaRequest(jammy.MetaCommand.LEARNING_MODE, [
          enable ? 0x01 : 0x00,
        ])
      ).data[0] === 0
    )
  } catch (error) {
    console.error(error)
    return undefined
  }
}

/**
 *  @return object with all supported metadata
 *
 *  Usage:
 *  let meta = await jammy.getAllMeta();
 */
jammy.getAllMeta = async function () {
  return {
    name: await jammy.getName(),
    serial: await jammy.getSerial(),
    firmware: await jammy.getFirmware(),
    soundbank: await jammy.getSoundbank(),
    batteryLevel: await jammy.getBatteryLevel(),
  }
}

/** Use this event handler for detect meta data events
 * If event contains metadata resolve({command, data}) will be invoce
 * If event contains error reject(error,code) will be invoce
 */
jammy.handleMetaData = (event) => {
  return new Promise((resolve, reject) => {
    if (
      event.data[2] === 0x02 &&
      event.data[3] === 0x06 &&
      event.data[4] === 0x71
    ) {
      const command = event.data[5]
      if (command === jammy.MetaCommand.ERROR) {
        console.log('Error  code: ', event.data[6])
        reject({ errorCode: event.data[6] })
      } else if (command === jammy.MetaCommand.BATTERY_LEVEL) {
        console.log('Meta message: Battery level = ', event.data[6], '%')
        resolve({
          command: command,
          message: event.data[6],
          data: [event.data[6]],
        })
      } else {
        var buf = []
        var data = []
        for (var i = 6; i < event.data.length - 1; i++) {
          data.push(event.data[i])
          buf.push(String.fromCharCode(event.data[i]))
        }
        const message = buf.join('')
        console.log('Meta message: ', message)
        resolve({ command: command, message: message, data: data })
      }
    } else {
      reject('Unsupported message')
    }
  })
}

jammy.isConnected = () => {
  console.log((midi.activeInputs || []).find((x) => x.onmidimessage))
  return !!(midi.activeInputs || []).find((x) => x.onmidimessage)
}

jammy.sendVersionRequestJammyG = async () => {
  // Load all available meta info from Jammy
  // const metaData =
  await meta.getAllMeta()
  // console.log("Meta info: "  + JSON.stringify(metaData));

  midi.sendMidiMessage([
    0xf0, 0x7f, 0x02, 0x06, 0x5e, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xf7,
  ])
}

jammy.sendVersionRequestJammyE = async () => {
  // Request right fw version
  jammy.sendParamRequest('get', {
    groupId: 3,
    paramId: 0,
    stringId: 6,
    left: false,
    value: 0,
  })
  await sleep(200)
  // Request left fw version
  jammy.sendParamRequest('get', {
    groupId: 3,
    paramId: 1,
    stringId: 6,
    left: true,
    value: 0,
  })
  await sleep(200)
  // Request left hw version
  jammy.sendParamRequest('get', {
    groupId: 3,
    paramId: 2,
    stringId: 6,
    left: true,
    value: 0,
  })
}

jammy.sendVersionsRequest = async () => {
  if (jammy.api === JAMMY_G) {
    await jammy.sendVersionRequestJammyG()
  } else {
    await jammy.sendVersionRequestJammyE()
  }
}

jammy.unpackJammySysexForG = (sysexData) => {
  const unpacked = []

  if (sysexData[5] !== 0) {
    unpacked.push(sysexData[5])

    for (let i = 0; i < 32; i += 2) {
      let newData = sysexData[6 + i]

      if (sysexData[6 + i] !== sysexData[6 + i + 1])
        newData = (newData << 1) | sysexData[6 + i + 1]

      unpacked.push(newData)
    }
  }

  return unpacked
}

jammy.sendParamRequest = (op, { groupId, paramId, stringId, left, value }) => {
  let opCode = 0
  switch (op) {
    case 'get':
      opCode = 0
      break
    case 'set':
      opCode = 1
      break
    case 'setget':
      opCode = 2
      break

    default:
      throw Error(`Unknown operation ${op}`)
  }
  if (jammy.api === JAMMY_G) {
    sendMidiParamRequestForG(stringId, groupId, paramId, value, left, opCode)
  } else if (jammy.api === JAMMY_E) {
    sendMidiParamRequestForE(stringId, groupId, paramId, value, left, opCode)
  }
}

function sendMidiParamRequestForG(
  stringId,
  groupId,
  paramId,
  value,
  left,
  opCode
) {
  midi.sendMidiMessage([
    0xf0,
    0x7f,
    0x02,
    0x06,
    0x68,
    stringId,
    groupId,
    paramId,
    (value >> 7) & 0x7f,
    value & 0x7f,
    left,
    opCode,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0xf7,
  ])
}

function sendMidiParamRequestForE(
  stringId,
  groupId,
  paramId,
  value,
  left,
  opCode
) {
  var method = 'GET'
  if (opCode === 0) {
    method = 'GET'
  } else if (opCode === 1) {
    method = 'SET'
  } else if (opCode === 2) {
    method = 'SET_AND_GET'
  }

  let command = jammy.generateRequestCommandForE(method, left, 0)
  midi.sendMidiMessage([
    0xf0, // Start
    0x00, // Jammy MIDI id
    0x02, // Jammy MIDI id
    0x27, // Jammy MIDI id
    command,
    stringId, // String number
    groupId, // Group number
    paramId, // Length 0
    (value >> 7) & 0x7f, // Reserved 1
    value & 0x7f, // Reserved 2
    0xf7, // End
  ])
}
// mc.SendSysEx(new byte[] { 0xF0, 0x7F, 0x02, 0x06, 0x68, (byte)prm.strID, (byte)prm.GroupID, (byte)prm.ParameterID, (byte)prm.Data0, (byte)prm.Data1, prm.isLeftPart, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF7 });

/**
 * Send request for capo position info
 * Request fret: F0 7F 02 06 68 06 00 04 00 00 00 01 00 00 00 00 00 00 00 F7
 * Response    :
 *
 */
jammy.sendCapoRequestForG = () => {
  if (jammy.api === JAMMY_G) {
    midi.sendMidiMessage([
      0xf0, 0x7f, 0x02, 0x06, 0x68, 0x06, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xf7,
    ])
  }
}

/**
 * @param {stringIdx} Number zero based string
 * @param {part} String left/right
 * @param {axis} String x/y
 * @param {brightness} Number 0-255, -1 for auto
 */
jammy.sendLedBrightness = (stringIdx, part, axis, brightness) => {
  if (stringIdx > 5) {
    throw Error(`invalid stringIdx ${stringIdx}`)
  }

  if (brightness > 255) {
    throw Error(`invalid brightness ${brightness}`)
  }

  const auto = brightness < 0
  const strOfs = axis === 'x' ? 0 : 6
  const side = part === 'right' ? 0 : 1

  midi.sendMidiMessage([
    0xf0,
    0x7f,
    0x02,
    0x06,
    auto ? 0x64 : 0x63,
    side,
    stringIdx + strOfs,
    auto ? 0 : (brightness & 0x80) === 0 ? brightness : brightness >> 1,
    auto ? 0 : (brightness & 0x80) === 0 ? brightness : brightness & 0x01,
    0,
    0,
    0,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0xf7,
  ])
}

// !!!! Jammy G methods

// Jammy G Diagnostic request
/**
 * Send request for string's diagnostics info
 *
 * @param {string} Number zero based string number
 */
jammy.sendDiagnosticRequestForG = (stringIdx) => {
  midi.sendMidiMessage([
    0xf0,
    0x7f,
    0x02,
    0x06,
    0x5e,
    stringIdx + 1,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0xf7,
  ])
}

// Jammy G Fret request
/**
 * Send request for string's fret info
 * Request fret: F0 7F 02 06 68 00 07 00 00 00 01 00 00 00 00 00 00 00 00 F7
 * Response    : F0 00 02 27 00 0A 00 00 07 07 00 00 00 00 00 00 01 01 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 F7
 *
 * @param {string} Number zero based string number
 */
jammy.sendFretRequestForG = (stringIdx) => {
  midi.sendMidiMessage([
    0xf0,
    0x7f,
    0x02,
    0x06,
    0x68,
    stringIdx,
    0x07,
    0x00,
    0x00,
    0x00,
    0x01,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0xf7,
  ])
}

jammy.readFretDiagnosticCallback = (event) => {
  if (event.data.length === 61) {
    const jammyData = event.data
    console.log('Frets data: ', midi.toHexString(jammyData.slice(0, 14)))
    var result = ''
    result = (jammyData[50] & 0x1f).toString(2)
    if (result.length === 4) {
      result = '0' + result
    }
    for (var i = 49; i >= 10; i -= 2) {
      const binary = (
        jammyData[i - 1] === jammyData[i]
          ? jammyData[i]
          : (jammyData[i - 1] << 1) + jammyData[i]
      ).toString(2)
      if (binary.length === 7) {
        result = result + '0'
      }
      result = result + binary
    }

    const string = 12 - jammyData[6]

    const frets = result.split(/(.{11})/).filter((O) => O)

    // console.log('Frets: ', frets)

    for (var j = 14; j >= 0; j--) {
      const fretId = 14 - j
      const foundIndex = frets[j].indexOf('0')
      if (foundIndex >= 0) {
        console.log(
          'Found touch on fret: ',
          fretId,
          ', segment: ',
          10 - foundIndex
        )
        jammy.onJammyESegmentWired(string, fretId, foundIndex)
      }
    }
  }
}

jammy.onDebugMidiResponse = function (response) {}

jammy.debugTouches = false

jammy.readTouchDiagnosticCallback = (event) => {
  if (jammy.debugTouches) {
    jammy.onDebugMidiResponse(
      '[ ' +
        midi.toHexString(event.data) +
        '] , size = (' +
        event.data.length +
        ')'
    )
  }
  if (event.data.length === 35) {
    const jammyData = event.data

    var result = []
    for (var i = 10; i < 34; i += 4) {
      result.push(midi.to14BitInt(jammyData, i))
    }
    // console.log('Touches: ', result)
    jammy.onJammyETouchWired(result)
  }
}

jammy.requestJammyESegmentWires = async function (active, strings = [4]) {
  console.log('Register: readFretDiagnosticCallback')
  midi.addEventListener('midimessage', jammy.readFretDiagnosticCallback)

  while (active() === true) {
    console.log('Request for strings: ', strings)
    for (const string in strings) {
      const id = 5 - string + 7
      console.log('Request for string id: ', id)
      jammy.sendDiagnosticRequestForE(true, 'GET', id)
      await sleep(100)
    }
  }

  console.log('Unregister: readFretDiagnosticCallback')
  midi.removeEventListener('midimessages', jammy.readFretDiagnosticCallback)
}

jammy.requestJammyETouches = async function (left, active, onSend) {
  midi.addEventListener('midimessage', jammy.readTouchDiagnosticCallback)

  while (active() === true) {
    jammy.sendDiagnosticRequestForE(left, 'GET', 5)
    if (onSend !== undefined) onSend()
    await sleep(100)
  }
  midi.removeEventListener('midimessages', jammy.readTouchDiagnosticCallback)
}

jammy.readMidiMessagesCallback = (event) => {
  if (event.data.length === 3) {
    const jammyData = event.data

    if (jammyData[0] >> 4 === 0x09) {
      const string = (6 - jammyData[0]) & 0x0f
      const note = jammyData[1]
      const velocity = jammyData[2]
      // if (velocity > 5) {
      // console.log('Note on: ', midi.toHexString(jammyData), ", st: ", string, ", n: ", note, "v: ", velocity);
      jammy.onJammyEStringWired(string, note, velocity)
      // }
    }
  }
}

jammy.registerJammyEMessages = function () {
  midi.addEventListener('midimessage', jammy.readMidiMessagesCallback)
}

jammy.unregisterJammyEMessages = function () {
  midi.removeEventListener('midimessage', jammy.readMidiMessagesCallback)
}

jammy.onJammyEMacAddress = function (macAddress) {
  // Implement this function
}

jammy.readBLEMACCallback = function (event) {
  midi.logIncoming = false

  const data = event.data
  var macAddress = midi.toHex(midi.to14BitInt(data, 10))
  for (var i = 12; i < 22; i = i + 2) {
    macAddress += ':'
    macAddress += midi.toHex(midi.to14BitInt(data, i))
  }

  console.log('Mac address: ', macAddress)

  midi.removeEventListener('midimessage', jammy.readBLEMACCallback)
  jammy.onJammyEMacAddress(macAddress)
}

jammy.metaDataStore = []

jammy.onJammyEMetaData = function (event) {
  const data = event.data
  if (data.length === 267 && data[5] === 0x18) {
    const header = midi.to16BitInt(data, 10)
    if (header === 0x4c50 && data[7] === 0x00) {
      jammy.metaDataStore = []
    }
    for (var i = 10; i < 266; i = i + 1) {
      jammy.metaDataStore.push(data[i])
    }
    if (data[7] === 0x02) {
      var serial = []
      for (var k = 4; k < 32; k = k + 2) {
        serial.push(midi.to14BitInt(jammy.metaDataStore, k))
      }
      // console.log("Meta data: ", midi.toHexString(jammy.metaDataStore))
      jammy.onJammyESerial(String.fromCharCode(...serial))
    }
  }
}

jammy.registerJammyEMetaData = function () {
  midi.addEventListener('midimessage', jammy.onJammyEMetaData)
}

jammy.unregisterJammyEMetaData = function () {
  midi.removeEventListener('midimessage', jammy.onJammyEMetaData)
}

jammy.sendJammyEMetaDataRequest = function () {
  jammy.sendDiagnosticRequestForE(false, 'GET', 0x01)
}

jammy.requestJammyEBLEMacAddress = async function () {
  midi.addEventListener('midimessage', jammy.readBLEMACCallback)
  console.log('requestJammyEBLEMacAddress')
  jammy.sendDiagnosticRequestForE(false, 'GET', 0x0e)
}

jammy.updateJammyEMetaData = async (serial, date, time) => {
  let data = [
    0x4c,
    0x4c,
    0x50,
    0x50, // header
  ]
  Array.prototype.map.call(serial, (c) => {
    let char = c.charCodeAt()
    midi.from14BitInt(char).forEach((e) => data.push(e)) // Serial
  })

  // data.push(0x00) // flags
  // data.push(0x00) // date
  // data.push(0x00) // time
  // data.push(0x00);  // num

  for (var j = 0; j < 476; j++) {
    data.push(0x00)
  }

  midi.from16BitInt(crc16(data)).forEach((e) => data.push(e)) // CRC16

  var data1 = data.slice(0, data.length / 2)
  var data2 = data.slice(data.length / 2)
  //console.log("Data: ", midi.toHexString(data), data.length);
  //console.log("Data 1: ", midi.toHexString(data1), data1.length);
  //console.log("Data 2: ", midi.toHexString(data2), data2.length);

  var message1 = jammy.generateJammyEMetaMessage(true, data1)
  var message2 = jammy.generateJammyEMetaMessage(false, data2)

  // console.log("Message1: ", midi.toHexString(message1), message1.length);
  // console.log("Message2: ", midi.toHexString(message2), message2.length);

  midi.sendMidiMessage(message1)
  await sleep(500)
  midi.sendMidiMessage(message2)
  await sleep(500)
}

jammy.generateJammyEMetaMessage = (first, data) => {
  let partId = first ? 0x00 : 0x02
  let message = [
    0xf0,
    0x00,
    0x02,
    0x27,
    0x0a,
    0x01,
    partId,
    0x40,
    0x00, // prefix
  ]

  data.forEach((e) => message.push(e))

  message.push(0xf7) // postfix
  return message
}

jammy.onJammyESegmentWired = function (string, fret, value) {}

jammy.onJammyEFretWired = function (string, fret) {}

jammy.onJammyETouchWired = function (touches) {}

jammy.onJammyEStringWired = function (string, note, velocity) {}

jammy.onJammyESerial = function (serial) {}

jammy.rebootJammyEInDFU = function () {
  jammy.sendParamRequest('setget', {
    groupId: 4,
    paramId: 1,
    stringId: 6,
    left: false,
    value: 1,
  })
}

// !!!! Jammy E methods

// Jammy E Diagnostic request

/**
 * Send request for string's diagnostics info
 *
 * @param {string} Number zero based string number
 */
jammy.sendDiagnosticRequestForE = (isLeft, method, type) => {
  let command = jammy.generateRequestCommandForE(method, isLeft, 1)

  midi.sendMidiMessage([
    0xf0, // Start
    0x00, // Jammy MIDI id
    0x02, // Jammy MIDI id
    0x27, // Jammy MIDI id
    command,
    type, // Diagnostic portion: 0 - Sensor *4, 1 - flash main page*4, 2 - packAccelerometerDiag *4,  5 - touch diag, 6 - led data, 13 - algo data
    0x03, // Portion status " 0 - start, 1 - continues, 2 - end, 3 - onePortion,"
    0x00, // Length 0
    0x00, // Length 1
    0xf7, // End
  ])
}

/**
 *  uint8_t isLeftPartRequest :1;
 *  uint8_t operationType :2; (dGET = 0, dSET, dSETANDGET,)
 *  uint8_t dataType :1;( = 1)
 *  uint8_t source :3;(for internal use)
 *  uint8_t nop :1;
 */
jammy.generateRequestCommandForE = (method, isLeft, dataType) => {
  var input = '0000' // Unused bits: 0000
  input += dataType === 0 ? '0' : '1' // Data type:1
  switch (method) {
    case 'GET':
      input += '00'
      break
    case 'SET':
      input += '01'
      break
    case 'SET_AND_GET':
      input += '10'
      break
    default:
      input += '00'
      break
  }
  input += isLeft ? '1' : '0'
  return parseInt(input, 2)
}

export default jammy
