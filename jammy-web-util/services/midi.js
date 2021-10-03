const midi = {}

midi.status = -1
midi.statusText = 'Not initialized'
midi.midiAccess = null
midi.logIncoming = false
midi.logOutgoing = false
midi.setManualSensorsControl = true

midi.activeInputs = []
midi.activeOutputs = []
midi.listeners = {}

midi.toHexString = function toHexString(byteArray) {
  return Array.from(byteArray, function (byte) {
    return ('0' + (byte & 0xff).toString(16).toUpperCase()).slice(-2)
  }).join(' ')
}

midi.init = function init() {
  if (!navigator.requestMIDIAccess) {
    midi.statusText = 'Not supported'
    midi.onMidiStatusChanged()
    return Promise.reject('MIDI not supported')
  }

  function onMIDISuccess(midiAccess) {
    console.log('MIDI ready!')
    midi.status = 1
    midi.statusText = 'Connected'
    midi.midiAccess = midiAccess
    midi.onMidiStatusChanged()
  }

  function onMIDIFailure(msg) {
    midi.status = 0
    midi.statusText = 'Error: ' + msg
    midi.onMidiStatusChanged()
    console.log('Failed to get MIDI access - ' + msg)
    return Promise.reject('MIDI FAILURE')
  }

  return navigator
    .requestMIDIAccess({ sysex: true })
    .then(onMIDISuccess, onMIDIFailure)
}

midi.isSupported = function () {
  return !!navigator.requestMIDIAccess
}

midi.hasAccess = function () {
  return midi.status === 1
}

midi.onMidiStatusChanged = function onMidiStatusChanged() {
  this.dispatchEvent({ type: 'midistatus' })
}

midi.saveState = function saveState() {
  localStorage.setItem(
    'pj.midi.state',
    JSON.stringify({
      activeInputs: midi.activeInputs.map((x) => x.id),
      activeOutputs: midi.activeOutputs.map((x) => x.id),
    })
  )
}

midi.loadState = function loadState() {
  let activeInputs = [],
    activeOutputs = []
  console.log(localStorage.getItem('pj.midi.state'))
  try {
    ;({ activeInputs, activeOutputs } = JSON.parse(
      localStorage.getItem('pj.midi.state')
    ))
  } catch {
    ;({ activeInputs, activeOutputs } = midi.findJammyPorts())
  }

  midi.bindPorts(activeInputs, activeOutputs)
  midi.onMidiStatusChanged()
}

midi.findJammyPorts = () => {
  let activeInputs = []
  let activeOutputs = []

  const jammyNames = [
    'MIDI function',
    'MIDI Gadget',
    'Jammy EVO',
    'Jammy E',
    'USB MIDI Device',
  ]

  if (midi.midiAccess) {
    for (let entry of midi.midiAccess.inputs.values()) {
      console.log(entry)
      if (jammyNames.includes(entry.name)) {
        activeInputs.push(entry.id)
        break
      }
    }

    for (let entry of midi.midiAccess.outputs.values()) {
      if (jammyNames.includes(entry.name)) {
        activeOutputs.push(entry.id)
        break
      }
    }
  }

  return {
    activeInputs,
    activeOutputs,
  }
}

midi.bindPorts = function bindPorts(inputIds, outputIds) {
  console.log('Bind inputs: ', inputIds, ', outputs: ', outputIds)
  inputIds = inputIds || []
  outputIds = outputIds || []

  midi.activeInputs = []
  midi.activeOutputs = []

  for (let entry of midi.midiAccess.inputs) {
    let input = entry[1]
    if (inputIds.indexOf(input.id.toString()) >= 0) {
      midi.activeInputs.push(input)
      input.onmidimessage = midi.onMidiMessage
      console.log('set on midimessage input on ', input.id, input.name)
    } else {
      input.onmidimessage = null
    }
  }

  for (let entry of midi.midiAccess.outputs) {
    let output = entry[1]
    if (outputIds.indexOf(output.id.toString()) >= 0) {
      midi.activeOutputs.push(output)
      console.log('set on midimessage output on ', output.id, output.name)
    }
  }
  midi.onMidiStatusChanged()
}

midi.sendMidiMessage = function sendMidiMessage(data, timestamp) {
  if (midi.logOutgoing) {
    console.log('outgoing midi outputs: ', midi.activeOutputs.length)
  }
  if (midi.activeOutputs.length !== 0) {
    for (var output of midi.activeOutputs) {
      if (midi.logOutgoing) {
        console.log('outgoing midi', output.name, midi.toHexString(data))
      }
      output.send(data, timestamp ? timestamp : 0)
    }
  } else {
    // console.warn("No device found");
  }
}

midi.midiToString = (midiData) => {
  if (midiData.length === 3) {
    const cmd = midiData[0] >> 4
    const ch = midiData[0] & 0x0f

    switch (cmd) {
      case 8:
        return `Note OFF; Ch: ${ch}; Note: ${midiData[1]}; Vel: ${midiData[2]}`
      case 9:
        return `Note ON; Ch: ${ch}; Note: ${midiData[1]}; Vel: ${midiData[2]}`
      case 0xb:
        return `CC; Ch: ${ch}; Ctrl: ${midiData[1]}; Val: ${midiData[2]}`
      case 0xe:
        let val = (midiData[2] << 7) + midiData[1]
        return `Pitch Band; Ch: ${ch}; Val: ${val}`
      default:
        break
    }
  }

  if (midiData[0] === 0xf0) {
    return 'Sysex'
  }

  return 'Unknown'
}

midi.onMidiMessage = function onMidiMessage(event) {
  if (midi.logIncoming) {
    console.log(event)
    console.log(
      'incoming midi',
      event.target.name,
      midi.toHexString(event.data),
      `[length: ${event.data.length}]`,
      `[length >= 60: ${event.data.length >= 60}]`,
      midi.midiToString(event.data)
    )
  }
  // midi.sendMidiMessage(event.data, event.timestamp);
  midi.dispatchEvent(event)
}

midi.sendNRPN8 = function sendNRPN8(high, low, value) {
  midi.sendMidiMessage([0xb0, 0x63, high, 0xb0, 0x62, low, 0xb0, 0x06, value])
}

midi.sendRPN8 = function sendRPN8(ch, high, low, value) {
  midi.sendMidiMessage([
    0xb0 + ch,
    0x65,
    high,
    0xb0 + ch,
    0x64,
    low,
    0xb0 + ch,
    0x06,
    value,
  ])
}

midi.sendGMReset = function sendGMReset() {
  midi.sendMidiMessage([0xf0, 0x7e, 0x7f, 0x09, 0x01, 0xf7])
}

midi.sendNoteOn = function sendNoteOn(channel, note, velocity) {
  midi.sendMidiMessage([
    0x90 + parseInt(channel),
    parseInt(note),
    parseInt(velocity),
  ])
}

midi.sendNoteOff = function sendNoteOff(channel, note, velocity) {
  midi.sendMidiMessage([
    0x80 + parseInt(channel),
    parseInt(note),
    parseInt(velocity || 0),
  ])
}

midi.addEventListener = function (type, callback) {
  if (!(type in midi.listeners)) {
    midi.listeners[type] = []
  }
  midi.listeners[type].push(callback)
}

midi.removeEventListener = function (type, callback) {
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

midi.dispatchEvent = function (event) {
  if (!(event.type in midi.listeners)) {
    return true
  }
  var stack = midi.listeners[event.type].slice()
  for (var i = 0, l = stack.length; i < l; i++) {
    if (stack[i]) stack[i].call(null, event)
  }
  return !event.defaultPrevented
}

midi.to16BitInt = (array, start) => {
  let hightResource1 = array[start]
  let hightResource2 = array[start + 1]

  let lowResource1 = array[start + 2]
  let lowResource2 = array[start + 3]

  let hight =
    hightResource1 === hightResource2
      ? hightResource1
      : (hightResource1 << 1) | hightResource2

  let low =
    lowResource1 === lowResource2
      ? lowResource1
      : (lowResource1 << 1) | lowResource2

  let result = (hight << 8) | low

  // console.log("hr1: ", hightResource1, "hr2: ", hightResource2, "lr1: ", lowResource1, "lr2: ", lowResource2, "H: ", hight, "L: ", low, "Result: ", result)

  return result
}

midi.toFloat32 = (array, start) => {
  let data = [
    midi.to14BitInt(array, start),
    midi.to14BitInt(array, start + 2),
    midi.to14BitInt(array, start + 4),
    midi.to14BitInt(array, start + 6),
  ].reverse()

  console.log('To Float32: ', midi.toHexString(data))

  // Create a buffer
  var buf = new ArrayBuffer(4)
  // Create a data view of it
  var view = new DataView(buf)

  // set bytes
  data.forEach(function (b, i) {
    view.setUint8(i, b)
  })

  // Read the bits as a float; note that by doing this, we're implicitly
  // converting it from a 32-bit float into JavaScript's native 64-bit double
  var num = view.getFloat32(0)
  // Done
  return num
}

midi.to14BitInt = (array, start) => {
  let hightResource1 = array[start]
  let hightResource2 = array[start + 1]

  let result =
    hightResource1 === hightResource2
      ? hightResource1
      : (hightResource1 << 1) | hightResource2

  return result
}

midi.toHex = function toHex(value) {
  return (value < 0xf ? '0' : '') + (value & 0xff).toString(16).toUpperCase()
}

export default midi
