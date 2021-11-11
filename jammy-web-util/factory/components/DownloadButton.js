import Image from 'next/image'

export const DownloadButton = ({ downloadLink }) => {
  return (
    <a download href={downloadLink}>
      <div className="download-button">
          <div className="download-button__icon">
            <Image
              src="/download-icon.svg"
              width={18.7}
              height={22.7}
              alt="Download Icon"
            />
          </div>
      </div>
    </a>
  )
}