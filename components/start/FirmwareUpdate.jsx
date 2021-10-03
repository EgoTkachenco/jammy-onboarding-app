import Navigation from '../Navigation'
import Lottie from 'react-lottie'
import * as animationDataG1 from '../../public/animations/Jammy G1 856x650'
import * as animationDataE1 from '../../public/animations/Jammy E1 946x650.json'
import * as animationDataG2 from '../../public/animations/Jammy dont touch G 375x667.json'
import * as animationDataE2 from '../../public/animations/Jammy dont touch E 946x650.json'

import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { FactoryTest } from '../../jammy-web-util/factory/FactoryTest'

function FirmwareUpdate({ children }) {
  return (
    <div className="page-container centered">
      <Navigation process={25} />
      {children}
    </div>
  )
}

const Firmware = () => {
  return (
    <FirmwareUpdate>
      <FactoryTest />
    </FirmwareUpdate>
  )
}

const Reboot = ({ jammyName, isRebooted, init }) => {
  const [isStopped, setisStopped] = useState(false)
  const [isPaused, setisPaused] = useState(false)
  useEffect(() => reloadAnimation(), [isRebooted])
  const commonProps = {
    loop: false,
    autoplay: true,
  }
  const eventListeners = [
    {
      eventName: 'complete',
      callback: () => setisPaused(true),
    },
  ]
  const optionsG1 = {
    ...commonProps,
    animationData: animationDataG1,
  }
  const optionsE1 = {
    ...commonProps,
    animationData: animationDataE1,
  }
  const optionsG2 = {
    ...commonProps,
    animationData: animationDataG2,
  }
  const optionsE2 = {
    ...commonProps,
    animationData: animationDataE2,
  }
  const router = useRouter()
  const reloadAnimation = () => {
    setisStopped(true)
    setisPaused(false)
    setTimeout(() => setisStopped(false), 100)
  }
  return (
    <FirmwareUpdate>
      <div className="reboot">
        <div
          className={`animation-screen ${isRebooted ? 'rebooted' : ''} ${
            isStopped ? 'stopped' : ''
          }`}
          onClick={() => reloadAnimation()}
        >
          {jammyName === 'Jammy G' &&
            (isRebooted ? (
              <Lottie
                options={optionsG2}
                height="42rem"
                width="23.4375rem"
                isPaused={isPaused}
                isStopped={isStopped}
                eventListeners={eventListeners}
              />
            ) : (
              <Lottie
                options={optionsG1}
                height="40.625rem"
                width="53.5rem"
                isPaused={isPaused}
                isStopped={isStopped}
                eventListeners={eventListeners}
              />
            ))}
          {jammyName === 'Jammy E' &&
            (isRebooted ? (
              <Lottie
                options={optionsE2}
                height="40.625rem"
                width="59.125rem"
                isPaused={isPaused}
                isStopped={isStopped}
                eventListeners={eventListeners}
              />
            ) : (
              <Lottie
                options={optionsE1}
                height="40.625rem"
                width="59.125rem"
                isPaused={isPaused}
                isStopped={isStopped}
                eventListeners={eventListeners}
              />
            ))}
        </div>

        {!isRebooted ? (
          <>
            <div className="title-text text-center">
              Please reboot the guitar
            </div>
            <div className="sm-text text-center">Waiting for reboot</div>
          </>
        ) : (
          <>
            <div className="animation-blank"></div>
            <div
              className={`rebooted-text ${isPaused ? 'show' : ''}`}
              onClick={() => reloadAnimation()}
            >
              <div className="title-text text-center">
                To make sure your first jam on Jammy is pleasant, <br />
                you’ll need to calibrate it correctly.
              </div>
              <div className="sm-text text-center">
                When you push the power button to turn your Jammy on, the LED
                turns purple for a few seconds to indicate that the sensors are
                determining their default values. Please avoid touching the
                strings while the LED is glowing purple — they’re in the process
                of calibration. Once the LED is white/light blue, your Jammy is
                ready to play.
              </div>
              <button
                className="btn btn-primary"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push('/sound-check')
                }}
              >
                Got it
              </button>
            </div>
          </>
        )}
      </div>
    </FirmwareUpdate>
  )
}

export { Firmware, Reboot }
