import { settingCategories } from './setting-categories'
import React from 'react'

/**
 * settingCategories - group | global
 * 10, 5, ... - groupId from configuration file
 *
 * @type {{[p: string]: {'5', '10'}, '[settingCategories.groups]': {'5': JSX.Element, '10': JSX.Element}}}
 */

export const settingTooltipMap = {
  [settingCategories.groups]: {
    '10': (
      <>
      Jammy sends the notes from each string into a separate MIDI channel,
      allowing you to split them between different virtual instruments or
      record tabs with accurate finger position information.
      <br />
      <br />
      Note that if you set multiple strings to the same MIDI Channel,
      bending one of these strings will pitch-bend the notes played on the
      other strings, as well.
    </>
    ),
    '5': (
      <>
        Controls whether string bending on Jammy will use the full range of
        the MIDI pitch wheel parameter or a fraction of it. This lets you
        adjust Jammy to the bending range of the software instrument that
        you’re playing.
        <br />
        <br />
        If you’re playing a software instrument and it feels like the strings
        go out of tune very easily, or making a full-step bend sends the note
        much higher than expected, you likely need to adjust the Pitch Bending
        Range (Divide By) parameter. For example, guitar instruments in
        GarageBand and Logic Pro will play bends naturally when Jammy’s Pitch
        Bending Range is divided by 24.
      </>
    )
  },
  [settingCategories.global]: {
    '1': (
      <>
        Fret Hand Muting lets you choose what will happen if you’re picking a
        string while dampening it with your fretting hand. The default option
        is “Don’t play notes”, so Jammy will not send any MIDI notes in this
        situation. If you choose “Play regular notes”, picking a dampened
        string will produce a MIDI note (determined by the last detected fret
        position before the string got dampened).
        <br />
        <br />
        Palm Muting lets you trigger MIDI commands by palm muting the strings
        with your picking hand. You can choose from a number of modes:
        <ul>
          <li>Off: No extra MIDI commands will be sent for palm muting.</li>
          <li>
            MIDI CC: A continuous control parameter (determined by MIDI CC
            Number) will be set to maximum (127) every time you palm mute the
            strings and minimum (0) every time you release them.
          </li>
          <li>
            Keyswitch: A MIDI note (determined by Primary Keyswitch) will
            start playing every time you palm mute the strings and stop
            playing every time you release them.
          </li>
          <li>
            2 Keyswitches: A MIDI note (determined by Primary Keyswitch)
            will be playing while you’re palm muting the strings and another
            MIDI note (Secondary Keyswitch) will play while you’re not palm
            muting.
          </li>
          <li>
            MIDI CC and Keyswitch: The “MIDI CC” and “Keyswitch” modes will
            work at the same time.
          </li>
          <li>
            MIDI CC and 2 Keyswitches: The “MIDI CC” and “2 Keyswitches”
            modes will work at the same time.
          </li>
        </ul>

        Palm muting is triggered when 4 or more strings are simultaneously
        touched by the picking hand.
      </>
    )
  }
}