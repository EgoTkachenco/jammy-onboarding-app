import Image from 'next/image'

export default function WelcomScreen(props) {
  return (
    <div className="page-container no-navigation centered connect-midi-device">
      {/* <div className="lg-text text-center">
        Hi there, thanks for choosing Jammy!
      </div>
      <div className="title-text text-center">
        {"Let's fine-tune your Jammy"} <br /> according to your preferences
      </div>
      <div className="lg-text text-center">
        Turn your Jammy on and connect <br /> it to your computer via USB cable
      </div> */}

      <button className="btn btn-primary" onClick={props.action}>
        Start
      </button>
    </div>
  )
}
