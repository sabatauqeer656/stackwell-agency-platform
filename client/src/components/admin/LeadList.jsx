import { Link } from 'react-router-dom';
import { Inbox } from 'lucide-react';
import Seo from '../Seo.jsx';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import FilterChips from '../ui/FilterChips.jsx';
import Input from '../ui/Input.jsx';
import Pagination from '../ui/Pagination.jsx';
import QueryState from '../ui/QueryState.jsx';
import Skeleton from '../ui/Skeleton.jsx';
import { statusLabel, statusVariant } from '../../features/admin/statusStyles.js';
import { useListParams } from '../../features/admin/useListParams.js';
import { useSearchBox } from '../../features/admin/useSearchBox.js';
import { cn } from '../../lib/utils.js';
import { formatDateTime, timeAgo } from '../../lib/format.js';

function ListSkeleton({ label }) {
  return (
    <div aria-busy="true">
      <p role="status" className="sr-only">
        Loading {label}
      </p>
      {[0, 1, 2, 3, 4].map((key) => (
        <div key={key} className="space-y-2 border-b border-slate-100 px-5 py-4 last:border-0">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

/**
 * The list screen shared by inquiries and quote requests: search, status chips, pagination, URL state.
 * What differs is passed in: the data hook, the statuses, the wording, and how one row looks (`renderRow`).
 */
export default function LeadList({ title, intro, noun, plural, statuses, useData, basePath, searchHint, emptyHint, renderRow }) {
  const { page, status, search, setStatus, setSearch, setPage, clear } = useListParams(statuses);
  const query = useData({ page, status, search });
  const statusOptions = [{ value: '', label: 'All' }, ...statuses.map((value) => ({ value, label: statusLabel[value] }))];

  const { text, setText, onChange: onSearchInput } = useSearchBox(search, setSearch);
  const clearAll = () => {
    setText('');
    clear();
  };

  // A short sentence that is also read aloud when the results change
  let summary = '';
  if (query.data) {
    const { items, meta } = query.data;
    const first = (meta.page - 1) * meta.limit + 1;
    summary = items.length ? `Showing ${first}-${first + items.length - 1} of ${meta.total} ${meta.total === 1 ? noun : plural}` : `No ${plural} found`;
  }
  const filtered = Boolean(status || search);

  const renderResults = ({ items, meta }) => {
    if (items.length === 0) {
      const lateEmptyPage = page > 1;
      return (
        <EmptyState
          icon={Inbox}
          title={lateEmptyPage ? `No ${plural} on this page` : filtered ? `No ${plural} match your filters` : `No ${plural} yet`}
          description={lateEmptyPage ? 'That page does not exist (any more).' : filtered ? 'Try a different search, or clear the filters.' : emptyHint}
          action={
            lateEmptyPage ? (
              <Button variant="outline" onClick={() => setPage(1)}>
                Go to the first page
              </Button>
            ) : filtered ? (
              <Button variant="outline" onClick={clearAll}>
                Clear filters
              </Button>
            ) : null
          }
        />
      );
    }

    return (
      <>
        <Card padded={false} className={cn('min-w-0 overflow-hidden transition-opacity', query.isPlaceholderData && 'opacity-60')}>
          <ul className="divide-y divide-slate-100">
            {items.map((item) => (
              <li key={item._id}>
                <Link to={`${basePath}/${item._id}`} className="block px-5 py-4 hover:bg-slate-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">{renderRow(item)}</div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <Badge variant={statusVariant[item.status]}>{statusLabel[item.status]}</Badge>
                      <time dateTime={item.createdAt} title={formatDateTime(item.createdAt)} className="text-xs text-slate-500">
                        {timeAgo(item.createdAt)}
                      </time>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
        <div className="mt-6">
          <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
        </div>
      </>
    );
  };

  return (
    <>
      <Seo title={title} noindex />
      <h1 className="text-h2">{title}</h1>
      <p className="mb-6 mt-1 text-slate-600">{intro}</p>

      <div className="mb-6 space-y-4">
        <div className="max-w-md">
          <Input label="Search" type="search" value={text} onChange={onSearchInput} placeholder={searchHint} maxLength={100} />
        </div>
        <FilterChips label="Filter by status" options={statusOptions} value={status} onChange={setStatus} />
      </div>

      <p aria-live="polite" className="mb-3 min-h-6 text-sm text-slate-500">
        {summary}
      </p>
      <QueryState query={query} skeleton={<Card padded={false}><ListSkeleton label={plural} /></Card>} errorTitle={`We could not load the ${plural}`}>
        {renderResults}
      </QueryState>
    </>
  );
}
