import Head from 'next/head'
import Navigation from '../components/Navigation'
import ContactFrom from '../components/contact/ContactFrom'
export default function Support() {
  return (
    <>
      <Head>
        <title>Settings</title>
      </Head>
      <Navigation process={75} />
      <ContactFrom />
    </>
  )
}
