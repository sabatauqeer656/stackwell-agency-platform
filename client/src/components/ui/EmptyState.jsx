import { cn } from '../../lib/utils.js';

// icon: a lucide component (e.g. Inbox). action: any node, usually a <Button>.
export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-card border border-dashed border-slate-300 px-6 py-12 text-center',
        className
      )}
    >
      {Icon && (
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      )}
      {/* An h2: it follows the page's h1 (or another h2) in every place this is used, so heading levels never skip a step */}
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      {description && <p className="mt-1 max-w-sm text-slate-600">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
