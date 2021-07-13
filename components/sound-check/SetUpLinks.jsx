import Link from 'next/link'
export default function SetUpLinks() {
  return (
    <div className="page-container set-up-links">
      <div className="title-text text-center">
        Great! <br /> Would you like to...
      </div>
      <Link href="/advanced" passHref>
        <div className="link-block">
          <div>
            Set up advanced guitar techniques (hammer-ons, slides, bending...)?
          </div>
          <ArrowIcon />
        </div>
      </Link>
      <Link href="/midi-settings" passHref>
        <div className="link-block">
          <div>
            Proceed to MIDI settings now and set up advanced guitar techniques
            later on
          </div>
          <ArrowIcon />
        </div>
      </Link>
    </div>
  )
}

const ArrowIcon = () => {
  return (
    <svg
      style={{ marginLeft: 'auto' }}
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19.9998 6.66667L17.6498 9.01667L26.9498 18.3333H6.6665V21.6667H26.9498L17.6498 30.9833L19.9998 33.3333L33.3332 20L19.9998 6.66667Z"
        fill="white"
      />
    </svg>
  )
}
