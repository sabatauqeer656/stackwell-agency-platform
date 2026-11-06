// A trap for spam bots. Real visitors never see or reach this field; bots fill in every
// input they find. The server treats any value in it as "this is a bot" and quietly saves nothing.
//
// It is pushed off-screen instead of using display:none, because many bots skip fields that are
// display:none but still fill in fields that are merely out of view. Each attribute has a job:
//   aria-hidden + tabIndex -1  -> screen readers and keyboard users skip it
//   autoComplete="off"         -> browsers and password managers do not fill it in by accident
//
// Usage: <HoneypotField {...register('website')} />
export default function HoneypotField(props) {
  return (
    <div aria-hidden="true" className="absolute -left-2499 h-px w-px overflow-hidden">
      <label>
        Leave this field empty
        <input type="text" tabIndex={-1} autoComplete="off" {...props} />
      </label>
    </div>
  );
}
