import midi from './services/midi'

const meta = {}

meta.MetaCommand = {
  NAME: 0x01,
  SERIAL: 0x02,
  FIRMWARE: 0x03,
  SOUNDBANK: 0x04,
  BATTERY_LEVEL: 0x05,
  LEARNING_MODE: 0x06,

  ERROR: 0xc0,
  SUCCESS: 0xc1,
}

meta.MetaError = {
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

meta.sendMetaRequest = function (command, data = undefined) {
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
      let handledData = await meta.handleMetaData(event)
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
meta.getName = async function () {
  try {
    return (await meta.sendMetaRequest(meta.MetaCommand.NAME)).message
  } catch (error) {
    return undefined
  }
}

/**
 * @returns serial number or undefined
 */
meta.getSerial = async function () {
  try {
    return (await meta.sendMetaRequest(meta.MetaCommand.SERIAL)).message
  } catch (error) {
    return undefined
  }
}

/**
 * @returns firmware version or undefined
 */
meta.getFirmware = async function () {
  try {
    return (await meta.sendMetaRequest(meta.MetaCommand.FIRMWARE)).message
  } catch (error) {
    return undefined
  }
}
/**
 * @returns soundbank version or undefined
 */
meta.getSoundbank = async function () {
  try {
    return (await meta.sendMetaRequest(meta.MetaCommand.SOUNDBANK)).message
  } catch (error) {
    return undefined
  }
}

/**
 * @returns battery level value or undefined
 */
meta.getBatteryLevel = async function () {
  try {
    return (await meta.sendMetaRequest(meta.MetaCommand.BATTERY_LEVEL)).data[0]
  } catch (error) {
    return undefined
  }
}

/**
 * Enable/disable Jammy learning mode
 * @returns status
 */
meta.enableLearningMode = async function (enable) {
  try {
    return (
      (
        await meta.sendMetaRequest(meta.MetaCommand.LEARNING_MODE, [
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
 *  let meta = await meta.getAllMeta();
 */
meta.getAllMeta = async function () {
  return {
    name: await meta.getName(),
    serial: await meta.getSerial(),
    firmware: await meta.getFirmware(),
    soundbank: await meta.getSoundbank(),
    batteryLevel: await meta.getBatteryLevel(),
  }
}

/** Use this event handler for detect meta data events
 * If event contains metadata resolve({command, data}) will be invoce
 * If event contains error reject(error,code) will be invoce
 */
meta.handleMetaData = (event) => {
  return new Promise((resolve, reject) => {
    if (
      event.data[2] === 0x02 &&
      event.data[3] === 0x06 &&
      event.data[4] === 0x71
    ) {
      const command = event.data[5]
      if (command === meta.MetaCommand.ERROR) {
        console.log('Error  code: ', event.data[6])
        reject({ errorCode: event.data[6] })
      } else if (command === meta.MetaCommand.BATTERY_LEVEL) {
        console.log('Battery  level: ', event.data[6], '%')
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

meta.addEventListener = function (type, callback) {
  if (!(type in midi.listeners)) {
    midi.listeners[type] = []
  }
  midi.listeners[type].push(callback)
}

meta.removeEventListener = function (type, callback) {
  if (!(type in midi.listeners)) {
    return
  }
  var stack = midi.listeners[type]
  for (var i = 0, l = stack.length; i < l; i++) {
    if (stack[i] === callback) {
      stack.splice(i, 1)
      return
    }
  }
}

meta.dispatchEvent = function (event) {
  if (!(event.type in midi.listeners)) {
    return true
  }
  var stack = midi.listeners[event.type].slice()

  for (var i = 0, l = stack.length; i < l; i++) {
    stack[i].call(null, event)
  }
  return !event.defaultPrevented
}

export default meta
