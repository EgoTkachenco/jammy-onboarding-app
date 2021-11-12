import React from 'react'

export const StartUpdateState = ({ onUpdateClick }) => {
  return (
    <>
      <div className='title-text text-center'>
        New firmware available
      </div>
      <br />
      <button
        className='btn btn-primary'
        onClick={onUpdateClick}
      >
        Start update
      </button>
    </>
  )
}