import { Check } from 'lucide-react';
import { cn } from '../../lib/utils.js';

// Shows where the visitor is in a multi-step form: ( 1 )----( 2 )----( 3 )----( 4 )
// The visible sentence "Step 2 of 4: Budget and timeline" is what everybody reads,
// and aria-current="step" marks the current item for screen readers.
export default function StepIndicator({ steps, current }) {
  return (
    <nav aria-label="Progress">
      <p className="text-sm font-medium text-slate-600">
        Step {current + 1} of {steps.length}: <span className="text-ink">{steps[current].title}</span>
      </p>
      <ol className="mt-3 flex items-center gap-2">
        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li key={step.id} aria-current={active ? 'step' : undefined} className="flex flex-1 items-center gap-2 last:flex-none">
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                  done && 'bg-brand-600 text-white',
                  active && 'bg-brand-600 text-white ring-4 ring-brand-100',
                  !done && !active && 'bg-slate-100 text-slate-500'
                )}
              >
                {done ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
              </span>
              <span className="sr-only">
                {step.title}
                {done && ' (completed)'}
              </span>
              {index < steps.length - 1 && (
                <span aria-hidden="true" className={cn('h-0.5 flex-1 rounded', done ? 'bg-brand-600' : 'bg-slate-200')} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
