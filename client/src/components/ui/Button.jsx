import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils.js';

// Full class names (not built dynamically) so Tailwind can detect them at build time.
const variants = {
  primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700',
  secondary: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
  outline: 'border border-slate-300 bg-white text-ink hover:bg-slate-50',
  ghost: 'text-slate-700 hover:bg-slate-100',
  // For actions that cannot be undone (delete)
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
  // For dark backgrounds (hero, call-to-action bands)
  light: 'bg-white text-brand-700 shadow-sm hover:bg-brand-50',
  'outline-light': 'border border-white/40 text-white hover:bg-white/10',
};

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-base',
  lg: 'h-12 px-7 text-lg',
};

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  children,
  ...props
}) {
  const isInactive = disabled || loading;
  const isNativeButton = Component === 'button';

  return (
    <Component
      // type="button" stops accidental form submits; callers can pass type="submit"
      {...(isNativeButton && { type: 'button', disabled: isInactive })}
      // Links and other elements have no `disabled`, so signal it with ARIA + CSS
      {...(!isNativeButton && isInactive && { 'aria-disabled': true })}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors',
        variants[variant],
        sizes[size],
        isInactive && 'pointer-events-none opacity-60',
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </Component>
  );
}
