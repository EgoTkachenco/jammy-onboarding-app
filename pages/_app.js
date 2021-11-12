import '../styles/index.scss'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Store from '../store'
import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { mobileAndTabletCheck } from '../public/utils'
import MIDISynth from '../components/sounds/MIDISynth'

const DISABLE_SOUND_ROUTES = [
  '/chrome-required',
  '/mobile',
  '/',
  '/sensitivity',
]

const MyApp = observer(({ Component, pageProps }) => {
  const router = useRouter()
  const welcomeTab = Store.startScreenTab
  const isPlaySound = Store.isPlaySound
  useEffect(() => {
    // Check browser and device
    // IF NOT Chrome ---> Screen with Chrome installation
    // IF Chrome ---> Screen with message to connect midi
    let isBrowserCheck =
      process.browser &&
      (!['/', '/mobile', '/chrome-required'].includes(router.pathname) ||
        welcomeTab !== 'Start')

    if (isBrowserCheck && mobileAndTabletCheck()) {
      router.push('/mobile')
    } else if (isBrowserCheck && !window.chrome) {
      router.push('/chrome-required')
    }
  }, [welcomeTab])
  // router ?
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
  }, [])

  const isAllowSound =
    process.browser && !DISABLE_SOUND_ROUTES.includes(router.pathname)

  return (
    <>
      <Head>
        <title>Jammy Onboarding</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        ></link>
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        ></link>
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        ></link>
        <link rel="manifest" href="/favicon/manifest.json"></link>
        <link
          rel="mask-icon"
          href="/favicon/safari-pinned-tab.svg"
          color="#5bbad5"
        ></link>
        <meta name="theme-color" content="#000000"></meta>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css" />
      </Head>
      <Component {...pageProps} />

      {/* Sound generator*/}
      {isAllowSound && isPlaySound && <MIDISynth />}
    </>
  )
})

export default MyApp
