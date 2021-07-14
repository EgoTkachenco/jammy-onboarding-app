import { useState } from 'react'
import { useRouter } from 'next/router'
import Stepper from '../Stepper'
import Image from 'next/image'
export default function Software() {
  const router = useRouter()
  const [active, setactive] = useState(null)
  const SOFTWARES = [
    { id: 1, name: 'Ableton Live', url: '/softwares/ableton.png' },
    { id: 2, name: 'Logic Pro X ', url: '/softwares/logic-pro.png' },
    { id: 3, name: 'GarageBand', url: '/softwares/garage-band.png' },
    { id: 4, name: 'FL Studio ', url: '/softwares/fl-studio.png' },
    { id: 5, name: 'Guitar Pro	', url: '/softwares/guitar-pro.png' },
    {
      id: 6,
      name: "I'd like to learn MIDI basics first ",
      url: '/softwares/default.png',
    },
  ]
  return (
    <>
      <Stepper
        onPrev={active ? () => setactive(null) : () => router.back()}
        prevText={
          <div className="d-flex align-center">
            <ArrowIcon />
            Previous Step
          </div>
        }
        onNext={active && (() => router.push('/midi-settings'))}
        nextText="Continue"
      />
      <div className="page-container software">
        {active ? (
          <div className="software__video">
            <Image
              src="/Youtube player.png"
              alt="video"
              layout="fill"
              objectFit="contain"
            />
          </div>
        ) : (
          <>
            <div className="title-text">
              {"Let's set up Jammy in your primary software."}
            </div>
            <div className="md-text">
              Select your DAW of choice to proceed.{' '}
            </div>

            <div className="software-list">
              {SOFTWARES.map((soft) => (
                <div
                  className="software-list__item"
                  key={soft.id}
                  onClick={() => setactive(soft)}
                >
                  <div className="software-list__item__img">
                    <Image
                      src={soft.url}
                      alt={soft.name}
                      width={46}
                      height={46}
                    />
                  </div>
                  <div className="md-text">{soft.name}</div>
                  <div className="software-list__item__arrow">
                    <ArrowIcon />
                  </div>
                </div>
              ))}
            </div>

            <Feedback />
          </>
        )}
      </div>
    </>
  )
}

const Feedback = () => {
  const [sent, setSent] = useState(false)
  return (
    <div className="software-feedback">
      <div className="caption-text text-center">
        if you can't find your DAW in the list, share the name of your DAW with
        us. We'll collect <br /> this info and if possible, add the
        corresponding MIDI preset later on.
      </div>
      {sent ? (
        <div className="software-feedback__sent">Sent</div>
      ) : (
        <div className="software-feedback__input">
          <input placeholder="Your DAW" type="text" />
          <button className="btn btn-primary" onClick={() => setSent(true)}>
            Send
          </button>
        </div>
      )}
    </div>
  )
}

const ArrowIcon = () => {
  return (
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
  )
}
