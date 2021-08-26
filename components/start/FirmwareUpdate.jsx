import Navigation from '../Navigation'
import Lottie from 'react-lottie'
import * as animationDataG1 from '../../public/animations/Jammy G1 856x650'
import * as animationDataE1 from '../../public/animations/Jammy E1 946x650.json'
import * as animationDataG2 from '../../public/animations/Jammy dont touch G 375x667.json'
import * as animationDataE2 from '../../public/animations/Jammy dont touch E 946x650.json'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
function FirmwareUpdate({ children }) {
  return (
    <div className="page-container centered">
      <Navigation process={25} />
      {children}
    </div>
  )
}

const CheckingForUpdate = () => {
  return (
    <FirmwareUpdate>
      <div className="title-text text-center">
        Checking for firmware updates
      </div>
      <Loader />
    </FirmwareUpdate>
  )
}

const Updating = ({ process }) => {
  return (
    <FirmwareUpdate>
      <div className="firmware-update">
        <div className="title-text text-center">
          Installing the latest firmware
        </div>
        <LoaderLine width={process + '%'} />
        <div className="sm-text text-center">{process}%</div>
      </div>
    </FirmwareUpdate>
  )
}

const Reboot = ({ jammyName, isRebooted, init }) => {
  const [isStopped, setisStopped] = useState(false)
  useEffect(() => {
    setisStopped(false)
  }, [isRebooted])
  const commonProps = {
    loop: false,
    autoplay: true,
  }
  const eventListeners = [
    {
      eventName: 'complete',
      callback: () => setisStopped(true),
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

  return (
    <FirmwareUpdate>
      <div className="reboot">
        {!isRebooted ? (
          <>
            <div className="title-text text-center">
              Please reboot the guitar
            </div>
            <div className="sm-text text-center">Waiting for reboot</div>
          </>
        ) : (
          <div className={`rebooted-text ${isStopped ? 'show' : ''}`}>
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
            <button className="btn btn-primary" onClick={init}>
              Got it
            </button>
          </div>
        )}

        <div
          className={`animation-screen ${isRebooted ? 'rebooted' : ''}`}
          onClick={() => setisStopped(false)}
        >
          {jammyName === 'Jammy G' &&
            (isRebooted ? (
              <Lottie
                options={optionsG2}
                height="42rem"
                width="23.4375rem"
                isStopped={isStopped}
                eventListeners={eventListeners}
              />
            ) : (
              <Lottie
                options={optionsG1}
                height="40.625rem"
                width="53.5rem"
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
                isStopped={isStopped}
                eventListeners={eventListeners}
              />
            ) : (
              // <Lottie options={optionsE1} height="946px" width="650px" />
              <Lottie
                options={optionsE1}
                height="40.625rem"
                width="59.125rem"
                isStopped={isStopped}
                eventListeners={eventListeners}
              />
            ))}
        </div>
      </div>
    </FirmwareUpdate>
  )
}

const Loader = () => {
  return (
    <div className="circle-loader">
      <svg
        width="46"
        height="46"
        viewBox="0 0 46 46"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <mask id="path-1-inside-1" fill="white">
          <path d="M23 0C17.3458 -6.74251e-08 11.8898 2.08271 7.67387 5.85037C3.45793 9.61804 0.777529 14.8066 0.144571 20.4252C-0.488388 26.0439 0.97045 31.6988 4.24248 36.31C7.5145 40.9212 12.3704 44.1656 17.8829 45.4235C23.3953 46.6815 29.178 45.8649 34.1265 43.1296C39.075 40.3944 42.8426 35.9322 44.7097 30.5952C46.5769 25.2582 46.4127 19.4205 44.2486 14.1969C42.0846 8.97327 38.0722 4.72983 32.9778 2.27696L31.2614 5.84171C35.4795 7.87263 38.8017 11.3861 40.5935 15.7112C42.3853 20.0362 42.5212 24.8698 40.9753 29.2887C39.4293 33.7076 36.3098 37.4022 32.2125 39.667C28.1152 41.9317 23.3273 42.6078 18.7631 41.5663C14.1989 40.5247 10.1783 37.8384 7.46911 34.0204C4.75994 30.2024 3.55205 25.5203 4.07612 20.8682C4.6002 16.216 6.81952 11.92 10.3102 8.80043C13.801 5.68087 18.3185 3.95642 23 3.95642V0Z" />
        </mask>
        <path
          d="M23 0C17.3458 -6.74251e-08 11.8898 2.08271 7.67387 5.85037C3.45793 9.61804 0.777529 14.8066 0.144571 20.4252C-0.488388 26.0439 0.97045 31.6988 4.24248 36.31C7.5145 40.9212 12.3704 44.1656 17.8829 45.4235C23.3953 46.6815 29.178 45.8649 34.1265 43.1296C39.075 40.3944 42.8426 35.9322 44.7097 30.5952C46.5769 25.2582 46.4127 19.4205 44.2486 14.1969C42.0846 8.97327 38.0722 4.72983 32.9778 2.27696L31.2614 5.84171C35.4795 7.87263 38.8017 11.3861 40.5935 15.7112C42.3853 20.0362 42.5212 24.8698 40.9753 29.2887C39.4293 33.7076 36.3098 37.4022 32.2125 39.667C28.1152 41.9317 23.3273 42.6078 18.7631 41.5663C14.1989 40.5247 10.1783 37.8384 7.46911 34.0204C4.75994 30.2024 3.55205 25.5203 4.07612 20.8682C4.6002 16.216 6.81952 11.92 10.3102 8.80043C13.801 5.68087 18.3185 3.95642 23 3.95642V0Z"
          stroke="#1B15FF"
          strokeWidth="12"
          mask="url(#path-1-inside-1)"
        />
      </svg>
    </div>
  )
}
const LoaderLine = ({ width }) => {
  return (
    <div className="loader-line-wrapper">
      <div className="loader-line-value" style={{ width: width }}></div>
    </div>
  )
}

export { CheckingForUpdate, Updating, Reboot }
