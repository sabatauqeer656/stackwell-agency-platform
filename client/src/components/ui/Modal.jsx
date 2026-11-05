import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils.js';

const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

// Built on the native <dialog> element: showModal() gives us focus trapping, Escape-to-close,
// an inert background and focus return for free. We add backdrop-click and scroll lock.
export default function Modal({ open, onClose, title, size = 'md', children }) {
  const dialogRef = useRef(null);
  const titleId = useId();

  // Keep the native dialog in sync with the `open` prop.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Lock page scrolling while the modal is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      // Fires for Escape and for dialog.close(): tell the parent to update its state.
      onClose={onClose}
      // A click on the dimmed backdrop targets the <dialog> itself (content sits in the inner div).
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={cn(
        'm-auto w-[calc(100%-2rem)] rounded-card p-0 shadow-2xl backdrop:bg-ink/50 backdrop:backdrop-blur-sm',
        sizes[size]
      )}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-h3">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="-m-1 rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-ink"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {/* Rendered only while open, so forms inside start fresh each time */}
        <div className="mt-4">{open && children}</div>
      </div>
    </dialog>
  );
}
