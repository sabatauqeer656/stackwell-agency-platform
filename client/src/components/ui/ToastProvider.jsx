import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastContext } from '../../context/ToastContext.js';
import { cn } from '../../lib/utils.js';

// Full class names (not built dynamically) so Tailwind can detect them.
const styles = {
  success: { icon: CheckCircle2, color: 'text-emerald-600', border: 'border-l-emerald-500' },
  error: { icon: AlertCircle, color: 'text-red-600', border: 'border-l-red-500' },
  info: { icon: Info, color: 'text-brand-600', border: 'border-l-brand-500' },
};

const DURATION = { success: 5000, info: 5000, error: 8000 }; // errors stay longer

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (type, message) => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, type, message }]);
      timers.current.set(id, setTimeout(() => dismiss(id), DURATION[type]));
    },
    [dismiss]
  );

  // Memoised so components using useToast() don't re-render whenever a toast appears.
  const api = useMemo(
    () => ({
      success: (message) => show('success', message),
      error: (message) => show('error', message),
      info: (message) => show('info', message),
      dismiss,
    }),
    [show, dismiss]
  );

  // Clear pending timers if the provider ever unmounts.
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-label="Notifications"
        role="region"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:left-auto sm:w-full sm:max-w-sm"
      >
        {toasts.map(({ id, type, message }) => {
          const { icon: Icon, color, border } = styles[type];
          return (
            <div
              key={id}
              // Errors interrupt screen readers (alert); the rest wait politely (status).
              role={type === 'error' ? 'alert' : 'status'}
              className={cn(
                'pointer-events-auto flex w-full items-start gap-3 rounded-lg border border-l-4 border-slate-200 bg-white p-4 shadow-card-hover',
                border
              )}
            >
              <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', color)} aria-hidden="true" />
              <p className="flex-1 text-sm text-ink">{message}</p>
              <button
                type="button"
                onClick={() => dismiss(id)}
                aria-label="Dismiss notification"
                className="-m-1 rounded p-1 text-slate-400 hover:text-ink"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
