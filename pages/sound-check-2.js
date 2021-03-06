import { useState } from 'react'
import Head from 'next/head'
import Navigation from '../components/Navigation'
import SoundCheckCmp from '../components/sound-check/SoundCheck'
import Stepper from '../components/Stepper'
import SetUpLinks from '../components/sound-check/SetUpLinks'
import { useRouter } from 'next/router'
export default function SoundCheck() {
  const router = useRouter()
  return (
    <>
      <Head>
        <title>Sound Check</title>
      </Head>
      <Navigation process={50} />
      <Stepper
        onPrev={() => router.push('/sound-check')}
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
      />
      <SetUpLinks />
    </>
  )
}
