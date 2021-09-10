import { useState, useEffect } from 'react'
import Image from 'next/image'
import Dialog from '../components/Dialog'
import { observer } from 'mobx-react-lite'
import Store from '../store'
import { useRouter } from 'next/router'
const Navigation = observer(({ process }) => {
  const isPlaying = Store.isPlaying
  const status = Store.status
  const router = useRouter()
  return (
    <>
      <div className="navigation-wrapper">
        <NavigationProcess process={process} />
        <div className="navigation-content">
          <div className="navigation__logo">
            <Image
              src="/jammy-white-logo__small.svg"
              layout="fill"
              objectFit="fill"
              alt="Logo"
            />
          </div>
          <div className={`navigation__label ${status}`}>{status}</div>

          <AnimatedLogo isPlaying={isPlaying} />
        </div>
      </div>
      {Store.status === 'Disconnected' && router.pathname !== '/' && (
        <Dialog>
          <div className="title-text text-center">
            Turn your Jammy on and connect it <br /> to your computer via USB
            cable!
          </div>
        </Dialog>
      )}
    </>
  )
})
export default Navigation

function NavigationProcess({ process }) {
  return (
    <div className="process-wrapper">
      <div
        className="process-value"
        style={{ width: process ? Number(process) + '%' : 0 }}
      ></div>
    </div>
  )
}

function AnimatedLogo({ isPlaying }) {
  const [lines, setvalues] = useState(null)
  useEffect(() => {
    if (isPlaying) {
      let interval = setInterval(() => {
        let newValues = new Array(9).fill(0).map(() => getRandomInt(51))
        setvalues(newValues)
      }, 600)
      return () => {
        clearInterval(interval)
      }
    } else {
      let newValues = new Array(9).fill(0)
      setvalues(newValues)
    }
  }, [isPlaying])
  return (
    <div className="navigation-animated-logo">
      <svg
        width="44"
        height="20"
        viewBox="0 0 44 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6.02197 4.21979H16.2637C17.1253 4.21979 17.6264 4.96264 17.6264 5.84616V15.9121H14.7692V7.16484H13.0989V15.9121H10.5055V7.16484H8.87912V15.9121H6.02197V4.21979Z"
          fill="#FF00FF"
        />
        <path
          d="M21.8903 4.21979H19.0332V15.9121H21.8903V4.21979Z"
          fill="#FF00FF"
        />
        <path
          d="M23.2529 4.21979H31.7364C32.598 4.21979 33.0991 4.96264 33.0991 5.84616V14.4615C33.0991 15.5561 32.6419 15.9121 31.6485 15.9121H23.2529V8.48352H26.154V13.055H30.2419V6.85715H23.2529V4.21979Z"
          fill="#FF00FF"
        />
        <path
          d="M37.3186 4.21979H34.4175V15.9121H37.3186V4.21979Z"
          fill="#FF00FF"
        />
      </svg>
      <div className="navigation-animated-logo__inner">
        {lines?.map((line, i) => (
          <div
            className="navigation-animated-logo__line"
            key={i}
            style={{ height: line + 'px' }}
          ></div>
        ))}
      </div>
    </div>
  )
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}
