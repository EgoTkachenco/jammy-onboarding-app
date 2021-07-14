import { useState } from 'react'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
export default function CustomSlider({ label, value }) {
  const [v, setv] = useState(value || 0)
  return (
    <div className="slider">
      <div className="slider-top">
        <div className="slider__label">{label}</div>
        <div className="slider__value">{v}%</div>
      </div>
      <Slider value={v} min={0} max={100} onChange={setv} />
    </div>
  )
}
