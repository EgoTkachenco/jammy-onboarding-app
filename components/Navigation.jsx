import Image from 'next/image'
export default function Navigation({ process }) {
  return (
    <div className="navigation-wrapper">
      <NavigationProcess process={process} />
      <div className="navigation-content">
        <div className="navigation__logo">
          <Image
            src="/jammy-white-logo__small.svg"
            height={26}
            width={58}
            alt="Logo"
          />
        </div>
        <div className="navigation__label success">Connected</div>
      </div>
    </div>
  )
}

function NavigationProcess({ process }) {
  return (
    <div className="process-wrapper">
      <div
        className="process-value"
        style={{ width: process ? Number(process) + '%' : 0 }}
      ></div>
    </div>
  )
}
