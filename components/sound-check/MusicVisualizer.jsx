import { useEffect, useState } from 'react'

const SIZE = 188
const MAX_HEIGHT = 110

const MusicVisualizer = () => {
  const [values, setvalues] = useState(null)
  useEffect(() => {
    let interval = setInterval(() => {
      let newValues = new Array(SIZE)
        .fill(0)
        .map(() => getRandomInt(MAX_HEIGHT))
      setvalues(newValues)
    }, 600)
    return () => {
      clearInterval(interval)
    }
  })
  return (
    <div className="music-visualizer">
      {values?.map((v, i) => (
        <div
          className="music-visualizer__value"
          key={i}
          style={{ height: v + 'px' }}
        ></div>
      ))}
    </div>
  )
}

export default MusicVisualizer

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}
