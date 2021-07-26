import Image from 'next/image'

export default function WelcomScreen(props) {
  return (
    <div className="page-container no-navigation centered connect-midi-device">
      <div className="img">
        <Image src="/jammy-white-logo.svg" width={72} height={72} alt="Jammy" />
      </div>
      <div className="lg-text text-center">
        Hi there, thanks for choosing Jammy!
      </div>
      <div className="title-text text-center">
        Let`s fine-tune the device in <br /> accordance with your preferences.
      </div>
      <div className="lg-text text-center">
        To begin with, turn on your Jammy and connect it via a USB cable.
      </div>

      <button className="btn btn-primary" onClick={props.action}>
        Done
      </button>
    </div>
  )
}
