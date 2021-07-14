export default function Stepper({
  prevText,
  onPrev,
  nextText,
  onNext,
  centerSlot,
}) {
  return (
    <div className="stepper-wrapper">
      {onPrev && (
        <button className="btn btn-dark stepper__prev" onClick={onPrev}>
          {prevText}
        </button>
      )}
      {centerSlot}
      {onNext && (
        <button className="btn btn-primary stepper__next" onClick={onNext}>
          {nextText}
        </button>
      )}
    </div>
  )
}
