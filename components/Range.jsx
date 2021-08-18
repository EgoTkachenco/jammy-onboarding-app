import { useState, useEffect } from 'react'
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
  return (
    <div className="slider">
      <div className="slider-top">
        <div className="slider__label">{label}</div>
        <div className="slider__value">{v}</div>
      </div>
      <Slider
        value={v}
        min={min}
        max={max}
        onChange={(v) => {
          setv(v)
          if (timeout) cleartimeout()
          settimeout(
            setTimeout(() => {
              onChange(v)
              cleartimeout()
            }, 300)
          )
        }}
      />
    </div>
  )
}
