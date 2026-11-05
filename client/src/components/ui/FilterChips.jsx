import { cn } from '../../lib/utils.js';

// A row of toggle buttons for filtering a list: [All] [Fintech] [Healthcare] ...
// aria-pressed tells screen readers which chip is currently selected.
export default function FilterChips({ label, options, value, onChange }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              selected
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
