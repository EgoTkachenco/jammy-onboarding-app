import { useRouter } from 'next/router'
import Stepper from '../Stepper'
import Image from 'next/image'
import FormsStore from '../../store/FormsStore'
import MidiPresetsStore from '../../store/MidiPresetsStore'
import { observer } from 'mobx-react-lite'
import { sleep } from '../../jammy-web-util/services/utils'
const Software = observer(() => {
  const router = useRouter()
  const SOFTWARES = MidiPresetsStore.SOFTWARES
  const setActive = (soft) => MidiPresetsStore.setActivePreset(soft)
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
      />
      <div className="page-container software">
        <div className="title-text">
          {"Let's set up Jammy in your primary software."}
        </div>
        <div className="md-text white-50">
          Select your DAW of choice to proceed.
        </div>

        <div className="software-list">
          {SOFTWARES.map((soft) => (
            <div
              className="software-list__item"
              key={soft.id}
              onClick={async () => {
                setActive(soft)
                await sleep(1000)
                router.push('/software-settings-2')
              }}
            >
              <div className="software-list__item__img">
                <Image src={soft.url} alt={soft.name} width={46} height={46} />
              </div>
              <div className="md-text">{soft.name}</div>
              <div className="software-list__item__arrow">
                <ArrowIcon />
              </div>
            </div>
          ))}
        </div>

        <Feedback />
      </div>
    </>
  )
})
export default Software
const Feedback = observer(() => {
  const isDawFormSended = FormsStore.isDawFormSended
  const sendForm = (e) => {
    e.preventDefault()
    var formData = new FormData(
      document.querySelector('.software-feedback__input')
    )
    let daw = formData.get('daw')
    if (daw) FormsStore.sendDawForm(daw)
  }
  return (
    <div className="software-feedback">
      <div className="caption-text text-center">
        if you can&apos;t find your DAW in the list, share the name of your DAW
        with us. We&apos;ll collect <br /> this info and if possible, add the
        corresponding MIDI preset later on.
      </div>
      {isDawFormSended ? (
        <div className="software-feedback__sent">Sent</div>
      ) : (
        <form className="software-feedback__input" onSubmit={sendForm}>
          <input placeholder="Your DAW" type="text" name="daw" />
          <button className="btn btn-primary" type="submit">
            Send
          </button>
        </form>
      )}
    </div>
  )
})

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
