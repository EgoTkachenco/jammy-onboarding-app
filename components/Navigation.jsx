import { useState, useEffect } from 'react'
import Image from 'next/image'
import Dialog from '../components/Dialog'
import { observer } from 'mobx-react-lite'
import Store from '../store'
import { useRouter } from 'next/router'
import { Switch } from 'antd'
const Navigation = observer(({ process }) => {
  const isPlaySound = Store.isPlaySound
  const versions = Store.versions
  const changeSound = (v) => (Store.isPlaySound = v)
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

          {versions && (
            <div className="fw-versions">
              <span>FW Left v.{versions.lf}</span>
              <span>FW Right v.{versions.rf}</span>
            </div>
          )}

          <div className="switch-wrapper sound-switch">
            <div className="sound-switch__label">SOUND</div>
            <Switch checked={isPlaySound} onChange={(v) => changeSound(v)} />
          </div>

          <AnimatedLogo isPlaying={isPlaying} />
        </div>
      </div>
      {Store.status === 'Disconnected' && router.pathname !== '/' && (
        <Dialog>
          <div
            className="title-text text-center"
            style={{ lineHeight: '4rem' }}
          >
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
      {process >= 0 && <div className="process-value" />}
      {process >= 25 && <div className="process-value" />}
      {process >= 50 && <div className="process-value" />}
      {process >= 75 && <div className="process-value" />}
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
      <div className="navigation-animated-logo__text">
        Software instrument is <br /> powered by Arturia
      </div>
      <Image src="/arturia.png" alt="Logo" width="24" height="24" />
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
