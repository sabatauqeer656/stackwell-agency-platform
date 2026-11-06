import LeadList from '../../components/admin/LeadList.jsx';
import { QUOTE_STATUSES, useQuotes } from '../../features/admin/quotes.js';
import { budgetRanges, labelOf, projectTypes } from '../../features/quotes/quoteOptions.js';
import { cn } from '../../lib/utils.js';

export default function Quotes() {
  return (
    <LeadList
      title="Quote requests"
      intro="Projects sent through the quote wizard, from first contact to won or lost."
      noun="quote request"
      plural="quote requests"
      statuses={QUOTE_STATUSES}
      useData={useQuotes}
      basePath="/admin/quotes"
      searchHint="Name, email, company or description"
      emptyHint="Requests sent through the quote wizard appear here."
      renderRow={(quote) => (
        <>
          <p className={cn('truncate text-ink', quote.status === 'new' ? 'font-bold' : 'font-semibold')}>{quote.name}</p>
          <p className="truncate text-sm text-slate-500">{quote.company ? `${quote.company} · ${quote.email}` : quote.email}</p>
          <p className="mt-1 truncate text-slate-800">
            {labelOf(projectTypes, quote.projectType)} · {labelOf(budgetRanges, quote.budgetRange)}
          </p>
          <p className="truncate text-sm text-slate-500">{quote.description}</p>
        </>
      )}
    />
  );
}
