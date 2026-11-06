import { CircleCheck } from 'lucide-react';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';

// Shown after a form was sent successfully (contact form, quote wizard).
// The heading takes keyboard focus (via `ref`), so screen reader users hear it straight away.
// React 19 lets a component receive `ref` like any other prop.
export default function FormConfirmation({ title, message, resetLabel, onReset, ref }) {
  return (
    <Card>
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <CircleCheck className="h-6 w-6" aria-hidden="true" />
      </span>
      <h2 ref={ref} tabIndex={-1} className="mt-5 text-h3 focus:outline-none">
        {title}
      </h2>
      <p role="status" className="mt-3 text-lg text-slate-600">
        {message}
      </p>
      <Button variant="outline" className="mt-6" onClick={onReset}>
        {resetLabel}
      </Button>
    </Card>
  );
}
