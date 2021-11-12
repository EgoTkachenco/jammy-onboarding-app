import { LoaderLine } from '../../../components/LoaderLine'
import React from 'react'

export const FirmwareUpdateProgressState = ({ progress }) => {
  return (
    <>
      <div className='title-text text-center'>
        Installing the latest firmware
      </div>

      <LoaderLine width={progress + '%'} />

      <div className='lg-text white text-center'>
        {progress + '%'}
      </div>
    </>
  )
}