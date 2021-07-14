import Head from 'next/head'
import Navigation from '../components/Navigation'
import ContactFrom from '../components/contact/ContactFrom'
export default function Settings() {
  return (
    <>
      <Head>
        <title>Settings</title>
      </Head>
      <Navigation process={75} />
      <div className="lg-text text-center">
        {
          "Let's adjust Picking Sensitivity in accordance to your playing style."
        }
      </div>
    </>
  )
}
