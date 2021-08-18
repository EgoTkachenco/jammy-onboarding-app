import '../styles/index.scss'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Store from '../store'
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
  const jammy = Store.jammy
  useEffect(() => {
    if (!jammy) router.push('/')
  }, [jammy])

  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Component {...pageProps} />
    </>
  )
})

export default MyApp
