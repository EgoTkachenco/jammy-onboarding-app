import Image from 'next/image'
export default function DeniedMidiAccess(props) {
  return (
    <div className="page-container no-navigation denied-access">
      <div className="title-text text-center">Denied Access</div>
      <div className="sm-text text-center white-50">
        This site needs permission to send messages to MIDI devices (such as
        your Jammy) <br />
        Follow instructions below to provide MIDI access in your browser
      </div>
      <div className="images-wrapper">
        <div className="img">
          <div className="step-text">Step 1</div>

          <Image
            src="/denied-step-1.png"
            width={264}
            height={274}
            alt="Denied Step 1"
          />
        </div>
        <div className="img">
          <div className="step-text">Step 2</div>

          <Image
            src="/denied-step-2.png"
            width={264}
            height={274}
            alt="Denied Step 2"
          />
        </div>
      </div>

      <button className="btn btn-primary" onClick={props.action}>
        Reconnect
      </button>
    </div>
  )
}
