import { Check } from 'lucide-react';
import { cn } from '../../lib/utils.js';

// A group of big selectable cards: either radio buttons (pick ONE) or checkboxes (pick SEVERAL).
//
// They are still real <input>s, just hidden visually (sr-only) with the card drawn next to them.
// That keeps everything the browser gives for free: keyboard use (arrow keys inside a radio group,
// Space on a checkbox), correct announcements by screen readers, and form integration.
// The <fieldset> and <legend> tell assistive technology "these options belong together, and this is the question".
//
//   <ChoiceCardGroup legend="Budget" name="budgetRange" options={[...]} register={register} error={...} />
export default function ChoiceCardGroup({ legend, hint, type = 'radio', name, options, register, error, columns = 'sm:grid-cols-2' }) {
  const errorId = `${name}-error`;

  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend className="text-base font-semibold text-ink">{legend}</legend>
      {hint && <p className="mt-1 text-sm text-slate-500">{hint}</p>}

      <div className={cn('mt-3 grid gap-3', columns)}>
        {options.map((option) => (
          <label key={option.value} className="relative block cursor-pointer">
            <input
              type={type}
              value={option.value}
              aria-invalid={error ? true : undefined}
              className="peer sr-only"
              {...register(name)}
            />
            {/* The card. `peer-checked:` styles apply when the hidden input before it is checked. */}
            <span
              className={cn(
                'flex h-full flex-col rounded-lg border bg-white p-4 pr-10 transition-colors',
                'peer-checked:border-brand-600 peer-checked:bg-brand-50 peer-checked:ring-1 peer-checked:ring-brand-600',
                'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-500',
                error ? 'border-red-400' : 'border-slate-300 hover:border-slate-400'
              )}
            >
              <span className="font-semibold text-ink">{option.label}</span>
              {option.description && <span className="mt-0.5 text-sm text-slate-600">{option.description}</span>}
            </span>
            {/* A check mark as well as the colour change, so "selected" never depends on colour alone */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-3 hidden h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white peer-checked:flex"
            >
              <Check className="h-3.5 w-3.5" />
            </span>
          </label>
        ))}
      </div>

      {error && (
        <p id={errorId} role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </fieldset>
  );
}
