import Navigation from '../components/Navigation'
import Lottie from 'react-lottie'
import * as animationDataG from '../public/animations/Jammy dont touch G 375x667.json'
import * as animationDataE from '../public/animations/Jammy dont touch E 946x650.json'
import Store from '../store'
import { observer } from 'mobx-react-lite'
const Page = observer(() => {
  const optionsG = {
    loop: true,
    autoplay: true,
    animationData: animationDataG,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  }
  const optionsE = {
    loop: true,
    autoplay: true,
    animationData: animationDataE,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  }
  return (
    <>
      <Navigation process={25} />
      <div className="page-container animation-screen">
        {/* <Lottie options={optionsG} height={667} width={375} /> */}
        <Lottie options={optionsE} height={650} width={946} />
      </div>
    </>
  )
})

export default Page
