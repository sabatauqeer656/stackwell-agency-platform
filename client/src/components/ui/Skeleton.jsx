import { cn } from '../../lib/utils.js';

// A grey placeholder block. Size it with className: <Skeleton className="h-4 w-40" />
// aria-hidden: it carries no information; pair it with a Spinner/status text if needed.
export default function Skeleton({ className, ...props }) {
  return (
    <div
      aria-hidden="true"
      className={cn('rounded-md bg-slate-200 motion-safe:animate-pulse', className)}
      {...props}
    />
  );
}
