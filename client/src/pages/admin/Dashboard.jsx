import { Link } from 'react-router-dom';
import Seo from '../../components/Seo.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Card from '../../components/ui/Card.jsx';
import QueryState from '../../components/ui/QueryState.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { useAuth } from '../../features/auth/useAuth.js';
import { useStats } from '../../features/admin/useStats.js';
import { statusLabel, statusVariant } from '../../features/admin/statusStyles.js';
import { labelOf, projectTypes } from '../../features/quotes/quoteOptions.js';
import { formatDateTime, timeAgo } from '../../lib/format.js';

// A big number you can click to open the matching section
function StatCard({ label, value, to, hint, highlight = false }) {
  return (
    <Card as={Link} to={to} hover>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className={`mt-2 text-4xl font-bold tracking-tight ${highlight && value > 0 ? 'text-brand-700' : 'text-ink'}`}>{value}</p>
      <p className="mt-1 text-sm text-slate-500">{hint}</p>
    </Card>
  );
}

// The latest few leads, newest first. `describe` turns one item into the line of text under the name.
function RecentList({ title, items, describe, to, itemTo = () => to, emptyText }) {
  return (
    // min-w-0: this card is a grid item. Grid items refuse to shrink below the width of their content, so one long
    // subject line would stretch the card (and the whole page) past the edge of a phone. min-w-0 lets it shrink and `truncate` do its job.
    <Card padded={false} className="min-w-0">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="text-lg">{title}</h2>
        <Link to={to} className="text-sm font-semibold text-brand-700 hover:underline">
          View all
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="px-5 py-8 text-center text-slate-500">{emptyText}</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((item) => (
            <li key={item._id}>
              <Link to={itemTo(item)} className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-slate-50">
                <span className="min-w-0">
                  <span className="block truncate font-medium text-ink">{item.name}</span>
                  <span className="block truncate text-sm text-slate-500">{describe(item)}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <Badge variant={statusVariant[item.status]}>{statusLabel[item.status]}</Badge>
                  <time dateTime={item.createdAt} title={formatDateTime(item.createdAt)} className="text-xs text-slate-500">
                    {timeAgo(item.createdAt)}
                  </time>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

const contentSections = [
  ['services', 'Services', '/admin/services'],
  ['solutions', 'Solutions', '/admin/solutions'],
  ['projects', 'Projects', '/admin/projects'],
  ['testimonials', 'Testimonials', '/admin/testimonials'],
  ['team', 'Team', '/admin/team'],
  ['faqs', 'FAQs', '/admin/faqs'],
];

const pipeline = ['new', 'reviewing', 'proposal-sent', 'won', 'lost'];

function DashboardSkeleton() {
  return (
    <div aria-busy="true" className="space-y-8">
      <p role="status" className="sr-only">
        Loading the dashboard
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((key) => (
          <Card key={key} className="space-y-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {[0, 1].map((key) => (
          <Card key={key} className="space-y-3">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </Card>
        ))}
      </div>
    </div>
  );
}

function Overview({ stats }) {
  const { inquiries, quotes } = stats.leads;
  const inProgress = quotes.byStatus.reviewing + quotes.byStatus['proposal-sent'];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="New inquiries" value={inquiries.byStatus.new} to="/admin/inquiries" hint={`${inquiries.total} in total`} highlight />
        <StatCard label="New quote requests" value={quotes.byStatus.new} to="/admin/quotes" hint={`${quotes.total} in total`} highlight />
        <StatCard label="Quotes in progress" value={inProgress} to="/admin/quotes" hint="Reviewing or proposal sent" />
        <StatCard label="Quotes won" value={quotes.byStatus.won} to="/admin/quotes" hint={`${quotes.byStatus.lost} lost`} />
      </div>

      <section aria-labelledby="pipeline-heading">
        <h2 id="pipeline-heading" className="text-lg">
          Quote pipeline
        </h2>
        <ul className="mt-3 flex flex-wrap gap-3">
          {pipeline.map((status) => (
            <li key={status} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2">
              <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>
              <span className="text-lg font-bold text-ink">{quotes.byStatus[status]}</span>
              <span className="sr-only">{quotes.byStatus[status] === 1 ? 'quote' : 'quotes'}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentList
          title="Latest inquiries"
          items={stats.recent.inquiries}
          describe={(item) => item.subject}
          to="/admin/inquiries"
          itemTo={(item) => `/admin/inquiries/${item._id}`}
          emptyText="No inquiries yet. They appear here as soon as someone uses the contact form."
        />
        <RecentList
          title="Latest quote requests"
          items={stats.recent.quotes}
          describe={(item) => labelOf(projectTypes, item.projectType)}
          to="/admin/quotes"
          emptyText="No quote requests yet. They appear here as soon as someone sends one."
        />
      </div>

      <section aria-labelledby="content-heading">
        <h2 id="content-heading" className="text-lg">
          Website content
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {contentSections.map(([key, label, to]) => {
            const { published, draft } = stats.content[key];
            return (
              <li key={key}>
                <Link to={to} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-brand-300 hover:bg-brand-50/40">
                  <span className="font-medium text-ink">{label}</span>
                  <span className="flex items-center gap-2 text-sm text-slate-600">
                    {published} published
                    {draft > 0 && <Badge variant="warning">{draft} draft{draft === 1 ? '' : 's'}</Badge>}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const query = useStats();

  return (
    <>
      <Seo title="Dashboard" noindex />
      <h1 className="text-h2">Dashboard</h1>
      <p className="mb-8 mt-1 text-slate-600">Welcome back, {user.name.split(' ')[0]}. Here is what is happening on the site.</p>

      <QueryState query={query} skeleton={<DashboardSkeleton />} errorTitle="We could not load the dashboard numbers">
        {(stats) => <Overview stats={stats} />}
      </QueryState>
    </>
  );
}
