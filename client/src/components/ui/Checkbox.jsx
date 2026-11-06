import { useId } from 'react';
import { cn } from '../../lib/utils.js';

// A checkbox with its label (and optional explanation) next to it. Works with register() like the other fields.
export default function Checkbox({ label, hint, className, id, ...props }) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;

  return (
    <div className={cn('flex items-start gap-3', className)}>
      <input
        id={checkboxId}
        type="checkbox"
        aria-describedby={hint ? `${checkboxId}-hint` : undefined}
        className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 accent-brand-600"
        {...props}
      />
      <div>
        <label htmlFor={checkboxId} className="font-medium text-ink">
          {label}
        </label>
        {hint && (
          <p id={`${checkboxId}-hint`} className="text-sm text-slate-500">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
