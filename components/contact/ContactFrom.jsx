import { useRouter } from 'next/router'
import Stepper from '../Stepper'
export default function ContactFrom() {
  const router = useRouter()
  return (
    <>
      <Stepper
        onPrev={() => router.back()}
        prevText={
          <div className="d-flex align-center">
            <ArrowIcon />
            Previous Step
          </div>
        }
        onNext={() => {}}
        nextText="Submit"
      />
      <div className="page-container">
        <div className="lg-text">Contact Jammy Support Band</div>
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
