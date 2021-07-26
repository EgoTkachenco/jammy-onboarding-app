import Image from 'next/image'

export default function WaitMidiConnect() {
  return (
    <div className="page-container no-navigation centered wait-midi-connect">
      <div className="img">
        <Image src="/jammy-white-logo.svg" width={72} height={72} alt="Jammy" />
      </div>
      <div className="lg-text white text-center">
        Allow this page to access MIDI devices so <br /> we could sync with your
        Jammy
      </div>
    </div>
  )
}
