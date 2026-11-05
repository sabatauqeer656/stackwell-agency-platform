import { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import Field from './Field.jsx';
import { controlClass, describedBy } from './fieldHelpers.js';
import { cn } from '../../lib/utils.js';

// Options are passed as children: <Select><option value="a">A</option></Select>
export default function Select({ label, hint, error, required, className, id, children, ...props }) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <Field id={selectId} label={label} hint={hint} error={error} required={required} className={className}>
      <div className="relative">
        <select
          id={selectId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(selectId, error, hint)}
          className={cn(controlClass(error), 'h-11 appearance-none pr-10')}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          aria-hidden="true"
        />
      </div>
    </Field>
  );
}
