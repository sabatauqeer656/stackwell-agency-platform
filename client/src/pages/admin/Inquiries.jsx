import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox } from 'lucide-react';
import Seo from '../../components/Seo.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import FilterChips from '../../components/ui/FilterChips.jsx';
import Input from '../../components/ui/Input.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import QueryState from '../../components/ui/QueryState.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { INQUIRY_STATUSES, useInquiries } from '../../features/admin/inquiries.js';
import { statusLabel, statusVariant } from '../../features/admin/statusStyles.js';
import { useListParams } from '../../features/admin/useListParams.js';
import { cn } from '../../lib/utils.js';
import { formatDateTime, timeAgo } from '../../lib/format.js';

const statusOptions = [{ value: '', label: 'All' }, ...INQUIRY_STATUSES.map((value) => ({ value, label: statusLabel[value] }))];

function ListSkeleton() {
  return (
    <div aria-busy="true">
      <p role="status" className="sr-only">
        Loading inquiries
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

export default function Inquiries() {
  const { page, status, search, setStatus, setSearch, setPage, clear } = useListParams(INQUIRY_STATUSES);
  const query = useInquiries({ page, status, search });

  // The box keeps what you type at once; the address (and the request) update 350 ms after you stop typing,
  // so a request is not sent for every single letter.
  const [text, setText] = useState(search);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const onSearchInput = (event) => {
    const value = event.target.value;
    setText(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSearch(value.trim()), 350);
  };
  const clearAll = () => {
    setText('');
    clear();
  };

  // A short sentence that is also read aloud when the results change
  let summary = '';
  if (query.data) {
    const { items, meta } = query.data;
    const first = (meta.page - 1) * meta.limit + 1;
    summary = items.length ? `Showing ${first}-${first + items.length - 1} of ${meta.total} ${meta.total === 1 ? 'inquiry' : 'inquiries'}` : 'No inquiries found';
  }
  const filtered = Boolean(status || search);

  const renderResults = ({ items, meta }) => {
    if (items.length === 0) {
      const lateEmptyPage = page > 1;
      return (
        <EmptyState
          icon={Inbox}
          title={lateEmptyPage ? 'No inquiries on this page' : filtered ? 'No inquiries match your filters' : 'No inquiries yet'}
          description={
            lateEmptyPage
              ? 'That page does not exist (any more).'
              : filtered
                ? 'Try a different search, or clear the filters.'
                : 'Messages sent through the contact form appear here.'
          }
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
            {items.map((inquiry) => (
              <li key={inquiry._id}>
                <Link to={`/admin/inquiries/${inquiry._id}`} className="block px-5 py-4 hover:bg-slate-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className={cn('truncate text-ink', inquiry.status === 'new' ? 'font-bold' : 'font-semibold')}>{inquiry.name}</p>
                      <p className="truncate text-sm text-slate-500">{inquiry.email}</p>
                      <p className="mt-1 truncate text-slate-800">{inquiry.subject}</p>
                      <p className="truncate text-sm text-slate-500">{inquiry.message}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <Badge variant={statusVariant[inquiry.status]}>{statusLabel[inquiry.status]}</Badge>
                      <time dateTime={inquiry.createdAt} title={formatDateTime(inquiry.createdAt)} className="text-xs text-slate-500">
                        {timeAgo(inquiry.createdAt)}
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
      <Seo title="Inquiries" noindex />
      <h1 className="text-h2">Inquiries</h1>
      <p className="mb-6 mt-1 text-slate-600">Messages sent through the contact form.</p>

      <div className="mb-6 space-y-4">
        <div className="max-w-md">
          <Input
            label="Search"
            type="search"
            value={text}
            onChange={onSearchInput}
            placeholder="Name, email, subject or company"
            maxLength={100}
          />
        </div>
        <FilterChips label="Filter by status" options={statusOptions} value={status} onChange={setStatus} />
      </div>

      <p aria-live="polite" className="mb-3 min-h-6 text-sm text-slate-500">
        {summary}
      </p>
      <QueryState query={query} skeleton={<Card padded={false}><ListSkeleton /></Card>} errorTitle="We could not load the inquiries">
        {renderResults}
      </QueryState>
    </>
  );
}
