import Head from 'next/head'
import Image from 'next/image'

export default function MobileScreen() {
  return (
    <>
      <Head>
        <title>My page title</title>
      </Head>
      <div className="page-container no-navigation centered mobile-screen">
        <div className="img">
          <Image
            src="/jammy-white-logo.svg"
            width={72}
            height={72}
            alt="Jammy"
          />
        </div>
        <div className="lg-text text-center white">
          To set up your Jammy, open
          <div className="chrome-img">
            <Image
              src="/chrome.png"
              width={39}
              height={39}
              alt="Install Chrome"
            />
          </div>
          Google Chrome browser <br />
          on your computer and go to <br />
          www.playjammy.com/start
        </div>
      </div>
    </>
  )
}
