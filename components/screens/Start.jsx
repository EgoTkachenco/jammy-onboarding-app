export default function WelcomScreen(props) {
  return (
    <div className="page-container no-navigation centered start-screen">
      <video
        autoPlay
        muted
        loop
        src="/Jammy E_ How to assemble and connect.mp4"
      />
      <button className="btn btn-primary" onClick={props.action}>
        StartStart onboarding
      </button>
    </div>
  )
}
