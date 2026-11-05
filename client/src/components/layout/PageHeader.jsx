import { cn } from '../../lib/utils.js';
import Container from './Container.jsx';

// The banner at the top of an inner page. It owns the page's single <h1>.
// children: optional extra content under the description (a button, filters...).
export default function PageHeader({ eyebrow, title, description, className, children }) {
  return (
    <header className={cn('bg-linear-to-b from-brand-50 to-white py-16 sm:py-20', className)}>
      <Container>
        <div className="max-w-3xl">
          {eyebrow && (
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-600">{eyebrow}</p>
          )}
          <h1 className="text-4xl sm:text-h1">{title}</h1>
          {description && <p className="mt-4 text-lg text-slate-600 sm:text-xl">{description}</p>}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </Container>
    </header>
  );
}
