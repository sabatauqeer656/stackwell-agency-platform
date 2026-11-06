import { Link } from 'react-router-dom';
import { Plus, Wrench } from 'lucide-react';
import Seo from '../../components/Seo.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import DynamicIcon from '../../components/ui/DynamicIcon.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import FilterChips from '../../components/ui/FilterChips.jsx';
import Input from '../../components/ui/Input.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import QueryState from '../../components/ui/QueryState.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { useAdminServices } from '../../features/admin/services.js';
import { useListParams } from '../../features/admin/useListParams.js';
import { useSearchBox } from '../../features/admin/useSearchBox.js';
import { cn } from '../../lib/utils.js';

// The address says "published" or "draft"; the API wants true or false.
const FILTERS = ['published', 'draft'];
const filterOptions = [
  { value: '', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Drafts' },
];
const toPublished = (status) => (status === 'published' ? true : status === 'draft' ? false : undefined);

function ListSkeleton() {
  return (
    <div aria-busy="true">
      <p role="status" className="sr-only">
        Loading services
      </p>
      {[0, 1, 2, 3].map((key) => (
        <div key={key} className="space-y-2 border-b border-slate-100 px-5 py-4 last:border-0">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export default function Services() {
  const { page, status, search, setStatus, setSearch, setPage, clear } = useListParams(FILTERS);
  const query = useAdminServices({ page, published: toPublished(status), search });
  const { text, setText, onChange } = useSearchBox(search, setSearch);
  const filtered = Boolean(status || search);
  const clearAll = () => {
    setText('');
    clear();
  };

  let summary = '';
  if (query.data) {
    const { items, meta } = query.data;
    const first = (meta.page - 1) * meta.limit + 1;
    summary = items.length ? `Showing ${first}-${first + items.length - 1} of ${meta.total} ${meta.total === 1 ? 'service' : 'services'}` : 'No services found';
  }

  const renderResults = ({ items, meta }) => {
    if (items.length === 0) {
      const lateEmptyPage = page > 1;
      return (
        <EmptyState
          icon={Wrench}
          title={lateEmptyPage ? 'No services on this page' : filtered ? 'No services match your filters' : 'No services yet'}
          description={lateEmptyPage ? 'That page does not exist (any more).' : filtered ? 'Try a different search, or clear the filters.' : 'Add your first service. It appears on the website once it is published.'}
          action={
            lateEmptyPage ? (
              <Button variant="outline" onClick={() => setPage(1)}>
                Go to the first page
              </Button>
            ) : filtered ? (
              <Button variant="outline" onClick={clearAll}>
                Clear filters
              </Button>
            ) : (
              <Button as={Link} to="/admin/services/new">
                New service
              </Button>
            )
          }
        />
      );
    }

    return (
      <>
        <Card padded={false} className={cn('min-w-0 overflow-hidden transition-opacity', query.isPlaceholderData && 'opacity-60')}>
          <ul className="divide-y divide-slate-100">
            {items.map((service) => (
              <li key={service._id}>
                <Link to={`/admin/services/${service._id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50">
                  <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 sm:flex">
                    <DynamicIcon name={service.icon} className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-ink">{service.title}</span>
                    <span className="block truncate text-sm text-slate-500">{service.summary}</span>
                    <span className="block truncate text-xs text-slate-400">/services/{service.slug}</span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <Badge variant={service.isPublished ? 'success' : 'warning'}>{service.isPublished ? 'Published' : 'Draft'}</Badge>
                    <span className="text-xs text-slate-500">Order {service.order}</span>
                  </span>
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
      <Seo title="Services" noindex />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-h2">Services</h1>
          <p className="mt-1 text-slate-600">What the agency offers. Published services appear on the website, in order.</p>
        </div>
        <Button as={Link} to="/admin/services/new">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New service
        </Button>
      </div>

      <div className="my-6 space-y-4">
        <div className="max-w-md">
          <Input label="Search" type="search" value={text} onChange={onChange} placeholder="Service title" maxLength={100} />
        </div>
        <FilterChips label="Filter by visibility" options={filterOptions} value={status} onChange={setStatus} />
      </div>

      <p aria-live="polite" className="mb-3 min-h-6 text-sm text-slate-500">
        {summary}
      </p>
      <QueryState query={query} skeleton={<Card padded={false}><ListSkeleton /></Card>} errorTitle="We could not load the services">
        {renderResults}
      </QueryState>
    </>
  );
}
