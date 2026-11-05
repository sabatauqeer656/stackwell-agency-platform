import { useId } from 'react';
import Field from './Field.jsx';
import { controlClass, describedBy } from './fieldHelpers.js';
import { cn } from '../../lib/utils.js';

export default function Textarea({ label, hint, error, required, className, id, rows = 5, ...props }) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <Field id={textareaId} label={label} hint={hint} error={error} required={required} className={className}>
      <textarea
        id={textareaId}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(textareaId, error, hint)}
        className={cn(controlClass(error), 'py-2.5')}
        {...props}
      />
    </Field>
  );
}
