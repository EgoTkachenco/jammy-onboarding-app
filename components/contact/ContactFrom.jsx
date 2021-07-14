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
        onNext={() => {}}
        nextText="Submit"
      />
      <div className="page-container support">
        <div className="title-text">Contact Jammy Support Band</div>
        <div className="support-form">
          <input
            className="support-form__field"
            type="email"
            placeholder="Enter your email"
          />
          <textarea
            placeholder="Describe the issue so we could better assist you"
            rows="8"
          ></textarea>
          <div className="sensors_values">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 2C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2H6ZM13 9V3.5L18.5 9H13Z"
                fill="#5C5C6D"
              />
            </svg>
            Sensors&apos; values automatically attached.
          </div>
          <div className="file-input">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.5 6V17.5C16.5 19.71 14.71 21.5 12.5 21.5C10.29 21.5 8.5 19.71 8.5 17.5V5C8.5 3.62 9.62 2.5 11 2.5C12.38 2.5 13.5 3.62 13.5 5V15.5C13.5 16.05 13.05 16.5 12.5 16.5C11.95 16.5 11.5 16.05 11.5 15.5V6H10V15.5C10 16.88 11.12 18 12.5 18C13.88 18 15 16.88 15 15.5V5C15 2.79 13.21 1 11 1C8.79 1 7 2.79 7 5V17.5C7 20.54 9.46 23 12.5 23C15.54 23 18 20.54 18 17.5V6H16.5Z"
                fill="#FF00FF"
              />
            </svg>
            Attach a short video demonstrating the problem (optional)
          </div>
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
