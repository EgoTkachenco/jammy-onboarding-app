import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Stepper from '../Stepper'
import Dialog from '../Dialog'
import Select from '../Select'
export default function Midi() {
  const router = useRouter()
  const [dialog, setDialog] = useState(false)
  const MIDISETTINGS = [
    {
      id: 1,
      name: 'MIDI Channels',
      settings: [
        {
          id: 1,
          name: 'String 1',
          value: 'Channel 6',
          options: [
            'Channel 1',
            'Channel 2',
            'Channel 3',
            'Channel 4',
            'Channel 5',
            'Channel 6',
          ],
        },
        {
          id: 2,
          name: 'String 2',
          value: 'Channel 6',
          options: [
            'Channel 1',
            'Channel 2',
            'Channel 3',
            'Channel 4',
            'Channel 5',
            'Channel 6',
          ],
        },
        {
          id: 3,
          name: 'String 3',
          value: 'Channel 6',
          options: [
            'Channel 1',
            'Channel 2',
            'Channel 3',
            'Channel 4',
            'Channel 5',
            'Channel 6',
          ],
        },
        {
          id: 4,
          name: 'String 4',
          value: 'Channel 6',
          options: [
            'Channel 1',
            'Channel 2',
            'Channel 3',
            'Channel 4',
            'Channel 5',
            'Channel 6',
          ],
        },
        {
          id: 5,
          name: 'String 5',
          value: 'Channel 6',
          options: [
            'Channel 1',
            'Channel 2',
            'Channel 3',
            'Channel 4',
            'Channel 5',
            'Channel 6',
          ],
        },
        {
          id: 6,
          name: 'String 6',
          value: 'Channel 6',
          options: [
            'Channel 1',
            'Channel 2',
            'Channel 3',
            'Channel 4',
            'Channel 5',
            'Channel 6',
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'String Bending',
      settings: [
        {
          id: 1,
          name: 'Pitch Bending Range (divide by)',
          value: '1',
          options: ['1', '2', '3', '4', '5'],
        },
      ],
    },
    {
      id: 3,
      name: 'String Bending',
      settings: [
        {
          id: 1,
          name: 'Fret Hand Muting ',
          value: 'Don’t play notes ',
          options: ['1', '2', '3', '4', '5'],
        },
      ],
    },
    {
      id: 4,
      name: 'Accelerometer',
      settings: [
        {
          id: 1,
          name: 'Accelerometer Mode ',
          value: 'Up and Down ',
          options: ['1', '2', '3', '4', '5'],
        },
        {
          id: 2,
          name: 'MIDI CC Number',
          value: '127',
          options: ['1', '2', '3', '4', '5'],
        },
      ],
    },
  ]
  return (
    <>
      <Stepper
        onPrev={() => router.back()}
        prevText={
          <div className="d-flex align-center">
            <ArrowIcon />
            Back
          </div>
        }
        onNext={() => setDialog(true)}
        nextText="Done"
      />
      <div className="page-container midi-settings">
        <div className="lg-text text-center">Customize MIDI settings</div>
        <div className="md-text text-center white-50">
          Open your DAW of choice, assign a virtual instrument and check the
          performance.
        </div>
        <div className="midi-list">
          {MIDISETTINGS.map((block) => (
            <React.Fragment key={block.id}>
              <div className="md-text white-50">{block.name}</div>
              {block.settings.map((setting) => (
                <div className="midi-list__item" key={setting.id}>
                  <div className="midi-list__item__label">{setting.name}</div>
                  <Select value={setting.value} options={setting.options} />
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>

        {dialog && (
          <Dialog close={() => setDialog(false)}>
            <div className="title-text text-center">
              Congrats on getting your <br /> Jammy all set up!
            </div>
            <div>
              <a
                className="no-effect"
                href="https://playjammy.com/plugin/"
                target="_blank"
                rel="noreferrer"
              >
                <button style={{ width: '100%' }} className="btn btn-primary">
                  {"I'm ready to install the Jammy desktop app"}
                </button>
              </a>
              <button
                className="btn btn-primary__outline"
                onClick={() => setDialog(false)}
              >
                I still have some questions, would like to contact support
              </button>
            </div>
          </Dialog>
        )}
      </div>
    </>
  )
}

const ArrowIcon = () => {
  return (
    <svg
      style={{ marginRight: '0.5rem' }}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 20L13.41 18.59L7.83 13L20 13L20 11L7.83 11L13.41 5.41L12 4L4 12L12 20Z"
        fill="white"
      />
    </svg>
  )
}
