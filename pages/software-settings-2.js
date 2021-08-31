import Head from 'next/head'
import Navigation from '../components/Navigation'
import Stepper from '../components/Stepper'
import YouTube from 'react-youtube'
import { useRouter } from 'next/router'
export default function SoftwareSettings() {
  const router = useRouter()
  return (
    <>
      <Head>
        <title>Settings</title>
      </Head>
      <Navigation process={75} />
      <Stepper
        onPrev={() => router.push('/software-settings')}
        prevText={
          <div className="d-flex align-center">
            <ArrowIcon />
            Previous Step
          </div>
        }
        onNext={() => router.push('/midi-settings')}
        nextText="Continue"
      />
      <div className="page-container software">
        <div className="software__video">
          <YouTube
            videoId="36XeB1T8l7Q"
            opts={{ autoplay: 1, width: '100%', height: '100%' }}
            containerClassName="software__video-container"
          />
        </div>
      </div>
    </>
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
