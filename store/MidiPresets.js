const DEFAULT_MIDI_PRESET = {
  name: 'Default',
  groups: [
    {
      id: 9,
      name: 'MIDI Channels',
      params: [
        {
          id: 0,
          type: 'ARRAY',
          global: true,
          name: 'String',
          optionName: 'Channel',
          part: 'right',
          min: 1,
          max: 10,
          default: [7, 6, 5, 4, 3, 2],
          value: [7, 6, 5, 4, 3, 2],
        },
      ],
    },
    {
      id: 0,
      name: 'String Bending',
      params: [
        {
          id: 0,
          type: 'BOOL',
          global: true,
          name: 'Trace over MIDI',
          part: 'right',
          default: 0,
          value: 0,
        },
        {
          id: 5,
          type: 'INT',
          global: true,
          name: 'Pitch Bending Range (Divide By)',
          part: 'right',
          min: 1,
          max: 24,
          default: 1,
          value: 1,
        },
        {
          id: 6,
          type: 'BOOL',
          global: true,
          name: 'Send program change',
          part: 'right',
          default: 0,
          value: 0,
        },
        {
          id: 7,
          type: 'BOOL',
          global: true,
          name: 'Left Hand Muting in MIDI (ex Send muted notes)',
          part: 'right',
          default: 0,
          value: 0,
        },
      ],
    },
    {
      id: 1,
      name: 'Palm muting',
      params: [
        {
          id: 0,
          type: 'LIST',
          global: true,
          name: 'Palm muting: Mode',
          part: 'right',
          default: 0,
          value: 0,
          options: [
            { id: 0, name: 'OFF' },
            { id: 1, name: 'MIDI CC' },
          ],
        },
        {
          id: 1,
          type: 'INT',
          global: true,
          name: 'Palm muting: Channel',
          part: 'right',
          min: 0,
          max: 10,
          default: 0,
          value: 0,
        },
        {
          id: 2,
          type: 'INT',
          global: true,
          name: 'Palm muting: MIDI CC Number',
          part: 'right',
          min: 1,
          max: 127,
          default: 90,
          value: 90,
        },
        {
          id: 3,
          type: 'LIST',
          global: true,
          name: 'Palm muting: Primary Keyswitch',
          part: 'right',
          default: 26,
          value: 26,
          options: [{ id: 26, name: 'D0 (26)' }],
        },
        {
          id: 4,
          type: 'LIST',
          global: true,
          name: 'Palm muting: Secondary Keyswitch',
          part: 'right',
          default: 24,
          value: 24,
          options: [{ id: 24, name: 'C0 (24)' }],
        },
        {
          id: 5,
          type: 'LIST',
          global: true,
          name: 'Palm muting: Notes mode',
          part: 'right',
          default: 1,
          value: 1,
          options: [
            { id: 1, name: '1 note' },
            { id: 2, name: '2 note' },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Accelerometer',
      params: [
        {
          id: 0,
          type: 'LIST',
          global: true,
          name: 'Accelerometer: Mode',
          part: 'right',
          default: 1,
          value: 1,
          options: [
            { id: 0, name: 'OFF' },
            { id: 1, name: 'Up & Down' },
            { id: 2, name: 'Up' },
          ],
        },
        {
          id: 1,
          type: 'INT',
          global: true,
          name: 'Accelerometer: MIDI CC Number',
          part: 'right',
          min: 1,
          max: 100,
          default: 74,
          value: 74,
        },
      ],
    },
    {
      id: 3,
      name: 'Volume knob press',
      params: [
        {
          id: 0,
          type: 'BOOL',
          global: true,
          name: 'Volume knob press: Mode',
          part: 'right',
          default: 1,
          value: 1,
          options: [
            { id: 0, name: 'OFF' },
            { id: 1, name: 'MIDI CC Toggle' },
          ],
        },
        {
          id: 1,
          type: 'INT',
          global: true,
          name: 'Volume knob press: MIDI CC Number',
          part: 'right',
          min: 1,
          max: 100,
          default: 80,
          value: 80,
        },
        {
          id: 2,
          type: 'LIST',
          global: true,
          name: 'Volume knob press: Primary Keyswitch',
          part: 'right',
          default: 25,
          value: 25,
          options: [{ id: 25, name: 'C#0 (25)' }],
        },
        {
          id: 3,
          type: 'LIST',
          global: true,
          name: 'Volume knob press: Secondary Keyswitch',
          part: 'right',
          default: 24,
          value: 24,
          options: [{ id: 24, name: 'C0 (24)' }],
        },
      ],
    },
    {
      id: 4,
      name: 'Volume knob turn',
      params: [
        {
          id: 0,
          type: 'BOOL',
          global: true,
          name: 'Volume knob turn: Mode',
          part: 'right',
          default: 1,
          value: 1,
          options: 1,
        },
        {
          id: 1,
          type: 'INT',
          global: true,
          name: 'Volume knob turn: MIDI CC Number',
          part: 'right',
          min: 1,
          max: 100,
          default: 70,
          value: 70,
        },
        {
          id: 2,
          type: 'INT',
          global: true,
          name: 'Volume knob turn: Starting value',
          part: 'right',
          min: 0,
          max: 90,
          default: 0,
          value: 0,
        },
        {
          id: 3,
          type: 'INT',
          global: true,
          name: 'Volume knob turn: Step',
          part: 'right',
          min: 3,
          max: 10,
          default: 10,
          value: 20,
        },
      ],
    },
    {
      id: 5,
      name: 'Ableton',
      params: [
        {
          id: 0,
          type: 'BOOL',
          global: true,
          name: 'Ableton Instant Mapping Mode',
          part: 'right',
          default: 0,
          value: 0,
        },
        {
          id: 1,
          type: 'INT',
          global: true,
          name: 'Ableton Instant Mapping: Step',
          part: 'right',
          min: 1,
          max: 50,
          default: 5,
          value: 5,
        },
      ],
    },
  ],
}

let GARAGE_BAND_NI = Object.assign({}, DEFAULT_MIDI_PRESET)
GARAGE_BAND_NI.name = 'GarageBand (Non-Guitar Instruments)'
GARAGE_BAND_NI.groups[3].params[1].value = 80
GARAGE_BAND_NI.groups[3].params[1].default = 80

GARAGE_BAND_NI.groups[4].params[1].value = 64
GARAGE_BAND_NI.groups[4].params[1].default = 64

GARAGE_BAND_NI.groups[5].params[1].value = 7
GARAGE_BAND_NI.groups[5].params[1].default = 7

GARAGE_BAND_NI.groups[5].params[2].value = 90
GARAGE_BAND_NI.groups[5].params[2].default = 90

GARAGE_BAND_NI.groups[5].params[3].value = 3
GARAGE_BAND_NI.groups[5].params[3].default = 3

let GARAGE_BAND = Object.assign({}, DEFAULT_MIDI_PRESET)
GARAGE_BAND.name = 'GarageBand (Guitar and Bass)'
GARAGE_BAND.groups[1].params[1].value = 24
GARAGE_BAND.groups[1].params[1].default = 24

GARAGE_BAND.groups[2].params[0].value = 1
GARAGE_BAND.groups[2].params[0].default = 1

GARAGE_BAND.groups[2].params[2].value = 1
GARAGE_BAND.groups[2].params[2].default = 1

GARAGE_BAND.groups[4].params[1].value = 64
GARAGE_BAND.groups[4].params[1].default = 64

GARAGE_BAND.groups[5].params[1].value = 7
GARAGE_BAND.groups[5].params[1].default = 7

GARAGE_BAND.groups[5].params[2].value = 90
GARAGE_BAND.groups[5].params[2].default = 90

GARAGE_BAND.groups[5].params[3].value = 3
GARAGE_BAND.groups[5].params[3].default = 3

let LOGIC_PRO_NI = Object.assign({}, DEFAULT_MIDI_PRESET)
LOGIC_PRO_NI.name = 'Logic Pro X (Non-Guitar Instruments)'
LOGIC_PRO_NI.groups[3].params[1].value = 80
LOGIC_PRO_NI.groups[3].params[1].default = 80

LOGIC_PRO_NI.groups[4].params[1].value = 64
LOGIC_PRO_NI.groups[4].params[1].default = 64

LOGIC_PRO_NI.groups[5].params[1].value = 7
LOGIC_PRO_NI.groups[5].params[1].default = 7

LOGIC_PRO_NI.groups[5].params[2].value = 90
LOGIC_PRO_NI.groups[5].params[2].default = 90

LOGIC_PRO_NI.groups[5].params[3].value = 3
LOGIC_PRO_NI.groups[5].params[3].default = 3

let LOGIC_PRO = Object.assign({}, DEFAULT_MIDI_PRESET)
LOGIC_PRO.name = 'GarageBand (Guitar and Bass)'
LOGIC_PRO.groups[1].params[1].value = 24
LOGIC_PRO.groups[1].params[1].default = 24

LOGIC_PRO.groups[2].params[0].value = 1
LOGIC_PRO.groups[2].params[0].default = 1

LOGIC_PRO.groups[2].params[2].value = 1
LOGIC_PRO.groups[2].params[2].default = 1

LOGIC_PRO.groups[4].params[1].value = 64
LOGIC_PRO.groups[4].params[1].default = 64

LOGIC_PRO.groups[5].params[1].value = 7
LOGIC_PRO.groups[5].params[1].default = 7

LOGIC_PRO.groups[5].params[2].value = 90
LOGIC_PRO.groups[5].params[2].default = 90

LOGIC_PRO.groups[5].params[3].value = 3
LOGIC_PRO.groups[5].params[3].default = 3

let GUITAR_PRO = Object.assign({}, DEFAULT_MIDI_PRESET)
GUITAR_PRO.name = 'Guitar Pro'
GUITAR_PRO.groups[0].params[0].value = [1, 2, 3, 4, 5, 6]
GUITAR_PRO.groups[0].params[0].default = [1, 2, 3, 4, 5, 6]

GUITAR_PRO.groups[3].params[0].value = 0
GUITAR_PRO.groups[3].params[0].default = 0

let ABLETON_INSTANT = Object.assign({}, DEFAULT_MIDI_PRESET)
ABLETON_INSTANT.name = 'Ableton Live (Instant Mapping)'
ABLETON_INSTANT.groups[4].params[0].value = 0
ABLETON_INSTANT.groups[4].params[0].default = 0

ABLETON_INSTANT.groups[5].params[0].value = 0
ABLETON_INSTANT.groups[5].params[0].default = 0

ABLETON_INSTANT.groups[6].params[0].value = 1
ABLETON_INSTANT.groups[6].params[0].default = 1

let ABLETON_MANUAL = Object.assign({}, DEFAULT_MIDI_PRESET)
ABLETON_MANUAL.name = 'Ableton Live (Manual Mapping)'

let AMBPLE_GUITAR = Object.assign({}, DEFAULT_MIDI_PRESET)
AMBPLE_GUITAR.name = 'Ample Guitar'
AMBPLE_GUITAR.groups[0].params[0].value = [1, 2, 3, 4, 5, 6]
AMBPLE_GUITAR.groups[0].params[0].default = [1, 2, 3, 4, 5, 6]

AMBPLE_GUITAR.groups[2].params[0].value = 1
AMBPLE_GUITAR.groups[2].params[0].default = 1

AMBPLE_GUITAR.groups[2].params[5].value = 2
AMBPLE_GUITAR.groups[2].params[5].default = 2

AMBPLE_GUITAR.groups[3].params[0].value = 2
AMBPLE_GUITAR.groups[3].params[0].default = 2

AMBPLE_GUITAR.groups[3].params[1].value = 1
AMBPLE_GUITAR.groups[3].params[1].default = 1

AMBPLE_GUITAR.groups[4].params[0].value = 2
AMBPLE_GUITAR.groups[4].params[0].default = 2

AMBPLE_GUITAR.groups[5].params[1].value = 7
AMBPLE_GUITAR.groups[5].params[1].default = 7

AMBPLE_GUITAR.groups[5].params[2].value = 63
AMBPLE_GUITAR.groups[5].params[2].default = 63

AMBPLE_GUITAR.groups[5].params[3].value = 4
AMBPLE_GUITAR.groups[5].params[3].default = 4

let SHREDDAGE = Object.assign({}, DEFAULT_MIDI_PRESET)
SHREDDAGE.name = 'Shreddage'
SHREDDAGE.groups[0].params[0].value = [1, 2, 3, 4, 5, 6]
SHREDDAGE.groups[0].params[0].default = [1, 2, 3, 4, 5, 6]

SHREDDAGE.groups[1].params[1].value = 2
SHREDDAGE.groups[1].params[1].default = 2

SHREDDAGE.groups[3].params[0].value = 2
SHREDDAGE.groups[3].params[0].default = 2

SHREDDAGE.groups[3].params[1].value = 1
SHREDDAGE.groups[3].params[1].default = 1

SHREDDAGE.groups[5].params[2].value = 127
SHREDDAGE.groups[5].params[2].default = 127

SHREDDAGE.groups[5].params[3].value = 5
SHREDDAGE.groups[5].params[3].default = 5

module.exports = {
  DEFAULT_MIDI_PRESET,
  GARAGE_BAND_NI,
  GARAGE_BAND,
  LOGIC_PRO_NI,
  LOGIC_PRO,
  GUITAR_PRO,
  ABLETON_INSTANT,
  ABLETON_MANUAL,
  AMBPLE_GUITAR,
  SHREDDAGE,
}

console.log(
  DEFAULT_MIDI_PRESET.groups[0].params[0].value,
  GARAGE_BAND_NI.groups[0].params[0].value
)
