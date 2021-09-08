import '../styles/index.scss'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Store from '../store'
import MidiStore from '../store/MidiStore'
import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { mobileAndTabletCheck } from '../public/utils'

const MyApp = observer(({ Component, pageProps }) => {
  const router = useRouter()
  useEffect(() => {
    // Check browser and device
    // IF NOT Chrome ---> Screen with Chrome installation
    // IF Chrome ---> Screen with message to connect midi
    if (process.browser && !window.chrome) router.push('/chrome-required')
    if (process.browser && mobileAndTabletCheck()) router.push('/mobile')
  }, [])
  // router ?
  console.log(MidiStore.synth)
  const { isAdmin } = router.query
  if (isAdmin) Store.isAdmin = true
  const isInited = Store.isInited || Store.isAdmin
  useEffect(() => {
    if (
      !isInited &&
      !['/chrome-required', '/mobile', '/'].includes(router.pathname)
    )
      Store.initJammy(router.pathname).catch((e) => {
        if (!Store.isAdmin) router.push('/')
      })
  }, [router])

  return (
    <>
      <Head>
        <title>Jammy Onboarding</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Component {...pageProps} />
    </>
  )
})

export default MyApp
