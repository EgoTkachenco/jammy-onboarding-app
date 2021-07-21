import { useState } from 'react'
import Range from '../Range'
export default function PresetCustomize({ preset }) {
  const SETTINGS = [
    { id: 1, name: 'Picking Loudness	' },
    { id: 2, name: 'Maximum Note Duration' },
    { id: 3, name: 'Bending and Vibrato Switch' },
    { id: 4, name: 'Right-Hand Muting Sensitivity' },
    { id: 5, name: 'Left-Hand Muting Sensitivity' },
    { id: 6, name: 'Hammer-On and Pull-Off Switch' },
    { id: 7, name: 'Hammer-On and Pull-Off Loudness' },
    { id: 8, name: 'Hammer-On and Pull-Off Algorithm ' },
    { id: 9, name: 'Hammer-On and Pull-Off Sensitivity' },
    { id: 10, name: 'Open String Pull-Off Sensitivity' },
    { id: 11, name: 'Slide Switch' },
    { id: 12, name: 'Slide Up Sensitivity' },
    { id: 14, name: 'Slide Down Sensitivity' },
    { id: 15, name: 'Accidental Note Prevention' },
    { id: 16, name: 'Velocity Compressor Switch' },
    { id: 17, name: 'Velocity Compressor Level' },
    { id: 18, name: 'Velocity Compressor Amount' },
    { id: 19, name: 'Velocity Minimum' },
    { id: 20, name: 'Velocity Maximum' },
  ]
  const [active, setactive] = useState(SETTINGS[0])
  return (
    <div className="presets-customize">
      <div className="title-text text-center">Customize the playability</div>
      <div className="md-text text-center">
        Based on “{preset?.name}” preset
      </div>
      <div className="presets-customize__inner">
        <div className="presets-list">
          {SETTINGS.map((setting) => (
            <div
              className={`presets-list__item ${
                active?.id == setting.id ? 'active' : ''
              }`}
              key={setting.id}
              onClick={() => setactive(setting)}
            >
              <div className="md-text">{setting.name}</div>
            </div>
          ))}
        </div>
        {active && (
          <div className="presets-side-card">
            <button className="presets-side-card__btn">
              Restore to default settings
            </button>
            <Range label="String 1 (high E)" value={80} />
            <Range label="String 2 (B)" value={80} />
            <Range label="String 3 (G)" value={80} />
            <Range label="String 4 (D)" value={80} />
            <Range label="String 5 (A)" value={80} />
            <Range label="String 6 (low E)" value={80} />
          </div>
        )}
      </div>
    </div>
  )
}
