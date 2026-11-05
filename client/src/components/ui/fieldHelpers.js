import { cn } from '../../lib/utils.js';

// Shared look for Input, Textarea and Select.
export const controlClass = (hasError) =>
  cn(
    'block w-full rounded-lg border bg-white px-3.5 text-base text-ink transition-colors',
    'placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
    hasError ? 'border-red-500' : 'border-slate-300 hover:border-slate-400'
  );

// Which element should screen readers read together with the control.
export const describedBy = (id, error, hint) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;
