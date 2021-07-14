import Head from 'next/head'
import Navigation from '../components/Navigation'
import Software from '../components/software/Software'
export default function SoftwareSettings() {
  return (
    <>
      <Head>
        <title>Settings</title>
      </Head>
      <Navigation process={75} />
      <Software />
    </>
  )
}
