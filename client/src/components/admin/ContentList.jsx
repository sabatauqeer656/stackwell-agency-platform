import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
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

function ListSkeleton({ label }) {
  return (
    <div aria-busy="true">
      <p role="status" className="sr-only">
        Loading {label}
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

/**
 * The list screen shared by every content type (services, solutions, projects, ...): search, a published/draft
 * filter, pagination, URL state and a "New" button. What differs is passed in:
 *   useData(params)  - the data hook
 *   renderRow(item)  - the left side of one row (an icon, the title, a short description...)
 *   renderBadges(item) - optional extra badges next to Published/Draft
 */
export default function ContentList({ title, intro, noun, plural, useData, adminPath, searchHint, emptyHint, renderRow, renderBadges }) {
  const { page, status, search, setStatus, setSearch, setPage, clear } = useListParams(FILTERS);
  const query = useData({ page, published: toPublished(status), search });
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
    summary = items.length ? `Showing ${first}-${first + items.length - 1} of ${meta.total} ${meta.total === 1 ? noun : plural}` : `No ${plural} found`;
  }

  const renderResults = ({ items, meta }) => {
    if (items.length === 0) {
      const lateEmptyPage = page > 1;
      return (
        <EmptyState
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
            ) : (
              <Button as={Link} to={`${adminPath}/new`}>
                New {noun}
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
            {items.map((item) => (
              <li key={item._id}>
                <Link to={`${adminPath}/${item._id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50">
                  <span className="flex min-w-0 flex-1 items-center gap-4">{renderRow(item)}</span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span className="flex flex-wrap justify-end gap-1">
                      {renderBadges?.(item)}
                      <Badge variant={item.isPublished ? 'success' : 'warning'}>{item.isPublished ? 'Published' : 'Draft'}</Badge>
                    </span>
                    <span className="text-xs text-slate-500">Order {item.order}</span>
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
      <Seo title={title} noindex />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-h2">{title}</h1>
          <p className="mt-1 text-slate-600">{intro}</p>
        </div>
        <Button as={Link} to={`${adminPath}/new`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          New {noun}
        </Button>
      </div>

      <div className="my-6 space-y-4">
        <div className="max-w-md">
          <Input label="Search" type="search" value={text} onChange={onChange} placeholder={searchHint} maxLength={100} />
        </div>
        <FilterChips label="Filter by visibility" options={filterOptions} value={status} onChange={setStatus} />
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
