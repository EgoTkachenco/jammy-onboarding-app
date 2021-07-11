import { useState } from 'react'
import Image from 'next/image'
const Chords = () => {
  const [open, setOpen] = useState(false)
  return (
    <div className={`chords-wrapper ${open ? 'active' : ''}`}>
      <div className="chords-activator" onClick={() => setOpen(!open)}>
        Find some basic chord shapes here
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.41 8.59L12 13.17L16.59 8.59L18 10L12 16L6 10L7.41 8.59Z"
            fill="white"
          />
        </svg>
      </div>

      <div className="chords-list">
        <Image
          src="/chords.png"
          layout="fill"
          objectFit="contain"
          alt="Chords"
        />
      </div>
    </div>
  )
}

export default Chords
