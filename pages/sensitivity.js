import Head from 'next/head'
import Navigation from '../components/Navigation'
import Stepper from '../components/Stepper'
import Range from '../components/Range'
import HelpTooltip from '../components/HelpTooltip'
import { useRouter } from 'next/router'
export default function Sensitivity() {
  const router = useRouter()
  return (
    <>
      <Head>
        <title>Sensitivity</title>
      </Head>
      <Navigation process={60} />
      <Stepper
        onPrev={() => router.back()}
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
        onNext={() => router.push('/sensitivity2')}
        nextText="Next step"
      />
      <div className="page-container sensitivity">
        <div className="lg-text text-center">
          Let's adjust Picking Sensitivity in <br />
          accordance to your playing style.
        </div>
        <div className="presets-side-card">
          <button className="presets-side-card__btn">
            Restore to default settings
          </button>
          <Range label="String 1 (high E)" value={80} />
          <Range label="String 2 (B)" value={80} />
          <Range label="String 3 (G)" value={80} />
          <Range label="String 4 (D)" value={80} />
          <Range label="String 5 (A)" value={80} />
          <Range label="String 6 (low E)" value={80} />
        </div>
        <HelpTooltip />
      </div>
    </>
  )
}
