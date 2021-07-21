import Head from 'next/head'
import Image from 'next/image'
export default function ChromeRequired() {
  return (
    <>
      <Head>
        <title>My page title</title>
      </Head>
      <div className="page-container no-navigation centered install-chrome-screen">
        <div className="img">
          <Image
            src="/chrome.png"
            width={72}
            height={72}
            alt="Install Chrome"
          />
        </div>

        <div className="lg-text text-center white">
          Install a compatible browser - Google Chrome, and <br /> reopen{' '}
          <a href="#">www.playjammy.com/start</a>
        </div>
        <a href="https://www.google.com/chrome/" className="no-effect">
          <button className="btn btn-primary">Download Chrome</button>
        </a>
      </div>
    </>
  )
}
