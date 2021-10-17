import { useState } from 'react'
import Image from 'next/image'
const InfoBtn = ({ info }) => {
  const [show, setShow] = useState(false)
  if (!info) return null
  return (
    <div
      className="info-btn"
      onMouseOver={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <Image src="/info.svg" alt="Info" width="24" height="24" />

      <div className={`info-btn__content${show ? ' show' : ''}`}>{info}</div>
    </div>
  )
}

export default InfoBtn
