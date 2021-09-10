import { useState, useEffect, useRef } from 'react'

export default function CustomSelect({ value, options, onChange, getOption }) {
  const [state, setstate] = useState(value)
  const [active, setActive] = useState(false)
  const handleOption = (option, i) => {
    setstate(option)
    setActive(false)
    if (onChange) onChange(option, i)
  }
  const toggleSelect = () => setActive(!active)
  const selectRef = useRef(null)
  useOutClick(selectRef, active, setActive, '.select-wrapper')
  return (
    <div ref={selectRef} className={`select-wrapper ${active ? 'active' : ''}`}>
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
              onClick={() => handleOption(item, i)}
            >
              {getOption ? getOption(item) : item}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function useOutClick(elRef, isActive, setActive, selector) {
  const handleOutsideClick = (e) => {
    const elem = e.target.closest(selector)
    if (!elem || elRef.current !== elem) {
      setActive(false)
    }
  }
  useEffect(() => {
    if (isActive) {
      document.addEventListener('mousedown', handleOutsideClick)
    } else {
      document.removeEventListener('mousedown', handleOutsideClick)
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  })
}
