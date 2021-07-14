import { useState } from 'react'
import Head from 'next/head'
import Navigation from '../components/Navigation'
import Stepper from '../components/Stepper'
import { useRouter } from 'next/router'
import Image from 'next/Image'
export default function Sensitivity() {
  const router = useRouter()
  const texts = [
    "1. Сheck where the sensor indicators are situated when they're not touching the strings",
    '2. If the calibration went well the bars should be situated along the center of their windows, showing values around 2000 for the fretboard-facing sensors (top row) and around 500 for the bridge-facing sensors (bottom row). ',
    '3. Pull the strings on the right-hand side of Jammy up and down to inspect the range. Normally, the values should reach around 0-200 when they pull the string all the way to one side and 800-1000 when they pull them all the way to the other side.',
    '4. If the bars aren’t in the middle, ask the user to hit "SAVE DATA" button which will send record the current state of sensors and automatically attach those values to their support email.',
    '5. Click on the “Auto” button for all the uncentered sensors. They might sometimes need to click the “Auto” button twice for the sensors to reach the middle of the window. After the auto-calibration procedure, ask ask the user to hit "SAVE DATA" one more time so we could compare the values later on.',
  ]
  const [step, setStep] = useState(0)
  const prev = () => {
    if (step === 0) router.push('/sensitivity')
    if (step > 0) setStep(step - 1)
  }
  const next = () => {
    if (step === 4) {
      return
    } else {
      setStep(step + 1)
    }
  }
  return (
    <>
      <Head>
        <title>Sensitivity</title>
      </Head>
      <Navigation process={60} />
      <Stepper
        centerSlot={
          <div className="support-btns">
            {texts.map((btn, i) => (
              <div
                className={`support-btns__item ${i <= step ? 'active' : ''}`}
                key={i}
                onClick={() => setStep(i)}
              >
                {i < step ? <Icon /> : i + 1}
              </div>
            ))}
          </div>
        }
        onPrev={prev}
        prevText={
          <div className="d-flex align-center">
            <svg
              style={{ marginRight: '0.5rem' }}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 20L13.41 18.59L7.83 13L20 13L20 11L7.83 11L13.41 5.41L12 4L4 12L12 20Z"
                fill="white"
              />
            </svg>
            Previous Step
          </div>
        }
        onNext={next}
        nextText={step === 4 ? 'Done' : 'Next step'}
      />
      <div className="page-container sensitivity">
        <div className="sensitivity-top">
          {step === 0 && (
            <div className="lg-text text-center">
              Let&apos;s adjust Picking Sensitivity in <br />
              accordance to your playing style.
            </div>
          )}
          <div className="md-text text-center">{texts[step]}</div>
        </div>
        <div className="sensitivity__image">
          <Image
            src="/sensitivity-help.png"
            alt="sensitivity-help"
            layout="fill"
          />
        </div>
      </div>
    </>
  )
}

const Icon = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.00039 16.2001L4.80039 12.0001L3.40039 13.4001L9.00039 19.0001L21.0004 7.0001L19.6004 5.6001L9.00039 16.2001Z"
        fill="white"
      />
    </svg>
  )
}
