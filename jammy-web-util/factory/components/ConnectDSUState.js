import Image from 'next/image'
import React from 'react'

export const ConnectDSUState = () => {
  return (
    <div className='text-center'>
      <div className='img'>
        <Image
          src='/jammy-white-logo.svg'
          width={72}
          height={72}
          alt='Jammy'
        />
      </div>
      <br />
      <div className='lg-text white text-center'>
        For firmware updates, Select Jammy DFU <br /> and click connect.
      </div>
    </div>
  )
}