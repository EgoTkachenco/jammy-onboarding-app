import Head from 'next/head'
import Navigation from '../components/Navigation'
import ContactFrom from '../components/contact/ContactFrom'
import FormsStore from '../store/FormsStore'
import { observer } from 'mobx-react-lite'
const Support = observer(() => {
  const isFormSended = FormsStore.isSupportFormSended
  const sendForm = (data) => FormsStore.sendSupportForm(data)
  return (
    <>
      <Head>
        <title>Settings</title>
      </Head>
      <Navigation process={75} />
      <ContactFrom sendForm={sendForm} isSended={isFormSended} />
    </>
  )
})

export default Support
