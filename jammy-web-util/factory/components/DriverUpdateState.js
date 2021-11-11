import React, { useCallback, useState } from 'react'
import { DownloadButton } from './DownloadButton'
import { driverDownloadLink } from '../../constants/driver-download-link'
import { Popover } from 'reactstrap'
import Image from 'next/image'

export const DriverUpdateState = ({ onUpdateClick }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const togglePopover = useCallback(() => {
    setIsPopoverOpen(!isPopoverOpen)
  }, [isPopoverOpen]);

  return (
    <>
      <div className='title-text text-center'>
        Driver update required
      </div>

      <br />

      <div className="lg-text white text-center bebe">
        Download an archive with the latest driver for your <br /> Windows PC by clicking the button below.
        Extract all files <br /> and <a id="driverUpdate" href="#"  className="link-orange dashed">run ‘Jammy E Driver Update’ file as an admin</a>.
        Once <br /> done, allow a few moments for the update to complete and <br /> click ‘Finish driver update’
      </div>

      <br />

      <DownloadButton downloadLink={driverDownloadLink} />

      <div className="download-driver-label">Download driver</div>

      <button
        className='btn btn-primary__outline finish-driver-update-button'
        onClick={onUpdateClick}
      >
        Finish Driver Update
      </button>

      <Popover
        placement="bottom"
        target="driverUpdate"
        trigger="hover"
        isOpen={isPopoverOpen}
        toggle={togglePopover}
      >
        <div className="driver-update-hint-image-wrapper"><Image
          width={340}
          height={315}
          src="/driver-update-hint.jpg"
          alt="Driver Update Hint"
        /></div></Popover>
    </>
  )
}