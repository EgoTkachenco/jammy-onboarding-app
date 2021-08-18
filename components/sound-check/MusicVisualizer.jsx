import { useEffect, useState } from 'react'

const SIZE = 188
const MAX_HEIGHT = 110

const MusicVisualizer = ({ isPlaying }) => {
  const [values, setvalues] = useState(null)
  useEffect(() => {
    if (isPlaying) {
      let interval = setInterval(() => {
        let newValues = new Array(SIZE)
          .fill(0)
          .map(() => getRandomInt(MAX_HEIGHT))
        setvalues(newValues)
      }, 300)
      return () => {
        clearInterval(interval)
      }
    } else {
      let newValues = new Array(SIZE).fill(0)
      setvalues(newValues)
    }
  }, [isPlaying])
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
