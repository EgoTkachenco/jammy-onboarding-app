import { useState, useEffect, useLayoutEffect } from 'react'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
export default function CustomSlider({ label, value, onChange, min, max }) {
  const [v, setv] = useState(value || 0)
  useEffect(() => {
    setv(value)
  }, [value])
  const [timeout, settimeout] = useState(null)
  const cleartimeout = () => {
    clearTimeout(timeout)
    settimeout(null)
  }

  useLayoutEffect(() => {
    return () => {
      cleartimeout()
    }
  }, [])

  const onChangeValue = (value) => {
    setv(value)
    if (timeout) cleartimeout()
    settimeout(
      setTimeout(() => {
        onChange(value)
        cleartimeout()
      }, 300)
    )
  }

  return (
    <div className="slider">
      <div className="slider-top">
        <div className="slider__label">{label}</div>
        <div className="slider__value">{v}</div>
      </div>
      <Slider
        value={v}
        min={min}
        autoFocus={false}
        max={max}
        onChange={(value) => {
          setv(value)
        }}
        onAfterChange={(value) => {
          onChangeValue(value)
        }}
      />
    </div>
  )
}
