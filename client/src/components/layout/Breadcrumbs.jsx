import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// Shows where the visitor is: Home / Services / Mobile App Development.
// The last item is the current page (no link) and is marked with aria-current="page".
export default function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1">
              {isLast ? (
                <span aria-current="page" className="font-medium text-slate-700">
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="rounded hover:text-brand-700 hover:underline">
                  {item.label}
                </Link>
              )}
              {!isLast && <ChevronRight className="h-4 w-4" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
