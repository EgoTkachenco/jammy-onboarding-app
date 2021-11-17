import Dialog from '../../Dialog'
import React from 'react'
import { useRouter } from 'next/router'

export const FinishOnboardingDialog = ({ setIsOnboardingDone, isOnboardingDone, setIsDialogOpen }) => {
  const router = useRouter()

  return (
    <Dialog hasTransparency={!isOnboardingDone} close={!isOnboardingDone && (() => setIsDialogOpen(false))}>
      <div className='title-text text-center pre-wrap'>
        {isOnboardingDone ? 'Enjoy your Jammy!' : 'Congrats on getting your \n Jammy all set up!'}
      </div>

      {!isOnboardingDone && <div className='d-flex flex-column'>
        <button
          className='btn btn-primary'
          onClick={() => setIsOnboardingDone(true)}
        >
          Finish onboarding
        </button>

        <button
          className='btn btn-primary__outline'
          onClick={() => router.push('/support')}
        >
          I still have some questions, would like to contact support
        </button>
      </div>}

    </Dialog>
  )
}