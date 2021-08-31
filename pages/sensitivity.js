import { useState } from 'react'
import Head from 'next/head'
import Navigation from '../components/Navigation'
import Stepper from '../components/Stepper'
import Dialog from '../components/Dialog'
import { useRouter } from 'next/router'
import { CalibrationG } from '../jammy-web-util/components/Calibrator'
// import 'bootstrap/dist/css/bootstrap.css'
// import '../styles/bootstrap/scss/bootstrap.scss'

export default function Sensitivity() {
  const router = useRouter()
  const texts = [
    {
      title: "Take a closer look at how your Jammy's sensors perform.",
      text: 'On this step, don’t touch the strings to check the default values detected by the sensors. If the calibration went well, the bars should reach the center of their windows, showing values around 2000 for the fretboard-facing sensors (top row) and around 500 for the bridge-facing sensors (bottom row).',
    },
    {
      title:
        "Let's check how the optical sensors capture the strings' movement.",
      text: 'For each string you can see the X and Y axes (the X is parallel to the frets and the Y is orthogonal to the fretboard). Pull the strings on the right-hand side of Jammy up and down to inspect the range. Normally, the values should reach around 0-200 when you pull the string all the way to one side and 800-1000 when you pull them all the way to the other side.',
    },
    {
      title: 'Try to recalibrate the sensors to improve performance. ',
      text: `If the bar isn't in the middle, click the "Auto" button. You might need to click it several times to center the sensor. Once done, check the strings' performance by playing a few chords.`,
    },
  ]
  const [step, setStep] = useState(0)
  const STEP_CONFIGS = [
    {
      showLeftPart: true,
      isManual: false,
    },
    {
      showLeftPart: false,
      isManual: false,
    },
    {
      showLeftPart: true,
      isManual: true,
    },
  ]
  const [showDialog, setShowDialog] = useState(false)
  const prev = () => {
    if (step === 0) router.push('/advanced')
    if (step > 0) setStep(step - 1)
  }
  const next = () => {
    if (step === 2) {
      setShowDialog(true)
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
        nextText={step === 3 ? 'Done' : 'Next step'}
      />
      <div className="page-container sensitivity">
        <div className="sensitivity-top">
          <div className="lg-text text-center" style={{ maxWidth: '67%' }}>
            {texts[step].title}
          </div>
          <div className="md-text text-center">{texts[step].text}</div>
        </div>
        <CalibrationG config={STEP_CONFIGS[step]} />
        {showDialog && (
          <Dialog close={() => setShowDialog(false)}>
            <div className="title-text text-center">
              Proceed to <br /> MIDI settings?
            </div>
            <button
              className="btn btn-primary"
              onClick={() => router.push('/software-settings')}
            >
              Yes
            </button>
            <button
              className="btn btn-primary__outline"
              onClick={() =>
                router.push({
                  pathname: '/support',
                  query: { type: 'sensitivity' },
                })
              }
            >
              {"No. I'd like to contact support"}
            </button>
          </Dialog>
        )}
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
