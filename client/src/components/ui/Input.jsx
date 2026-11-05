import { useId } from 'react';
import Field from './Field.jsx';
import { controlClass, describedBy } from './fieldHelpers.js';
import { cn } from '../../lib/utils.js';

// `ref` is a normal prop in React 19, so React Hook Form's register() works via {...props}.
export default function Input({ label, hint, error, required, className, id, ...props }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <Field id={inputId} label={label} hint={hint} error={error} required={required} className={className}>
      <input
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(inputId, error, hint)}
        className={cn(controlClass(error), 'h-11')}
        {...props}
      />
    </Field>
  );
}
