import { cn } from '../../lib/utils.js';

// Label + control + hint/error text. The control itself is passed as children.
export default function Field({ id, label, hint, error, required, className, children }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}
          {required && (
            <span className="ml-0.5 text-red-600" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-sm text-slate-500">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
