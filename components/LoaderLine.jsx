import React from 'react'

export const LoaderLine = ({ width }) => {
  return (
    <div className="loader-line-wrapper">
      <div className="loader-line-value" style={{ width: width }} />
    </div>
  )
}