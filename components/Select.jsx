import { useState } from 'react'

export default function CustomSelect({ value, options }) {
  const [state, setstate] = useState(value)
  const [active, setActive] = useState(false)
  const handleOption = (option) => {
    setstate(option)
    setActive(false)
  }
  const toggleSelect = () => setActive(!active)

  return (
    <div className={`select-wrapper ${active ? 'active' : ''}`}>
      <div className="select" onClick={toggleSelect}>
        {state}
      </div>
      {active && (
        <div className="select-options">
          {options.map((item, i) => (
            <div
              className={`select-options__item ${
                item === state ? 'active' : ''
              }`}
              key={i}
              onClick={() => handleOption(item)}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
