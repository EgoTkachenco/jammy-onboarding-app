import React from 'react'

export const ErrorState = ({ error }) => {
  return (
    <>
      <p>Error: </p>
      <p>{error}</p>
    </>
  )
}