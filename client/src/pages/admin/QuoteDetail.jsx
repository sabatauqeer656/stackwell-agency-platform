import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Mail } from 'lucide-react';
import Seo from '../../components/Seo.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import DetailPageState from '../../components/ui/DetailPageState.jsx';
import Select from '../../components/ui/Select.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import { QUOTE_STATUSES, useDeleteQuote, useDownloadAttachment, useQuote, useUpdateQuote } from '../../features/admin/quotes.js';
import { statusLabel, statusVariant } from '../../features/admin/statusStyles.js';
import { useAuth } from '../../features/auth/useAuth.js';
import { budgetRanges, labelOf, projectTypes, timelines } from '../../features/quotes/quoteOptions.js';
import { useToast } from '../../hooks/useToast.js';
import { getApiError } from '../../lib/apiErrors.js';
import { formatDateTime, formatFileSize, timeAgo } from '../../lib/format.js';

const NOTES_MAX = 2000;

function Detail({ label, children }) {
  return (
    <div>
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="break-words font-medium text-ink">{children}</dd>
    </div>
  );
}

function Attachments({ quote }) {
  const toast = useToast();
  const download = useDownloadAttachment();
  const [busyIndex, setBusyIndex] = useState(null);

  // The link is made fresh at the click (it expires after 5 minutes) and opened in a new tab.
  const open = async (index) => {
    setBusyIndex(index);
    try {
      const { url } = await download.mutateAsync({ quoteId: quote._id, index });
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      toast.error(getApiError(error).message);
    } finally {
      setBusyIndex(null);
    }
  };

  return (
    <Card>
      <h2 className="text-lg">Attachments</h2>
      {quote.attachments.length === 0 ? (
        <p className="mt-3 text-slate-500">No files were attached.</p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100">
          {quote.attachments.map((file, index) => (
            <li key={index} className="flex items-center justify-between gap-4 py-3">
              <span className="flex min-w-0 items-center gap-3">
                <FileText className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block truncate font-medium text-ink">{file.originalName}</span>
                  <span className="block text-sm text-slate-500">{formatFileSize(file.size)}</span>
                </span>
              </span>
              <Button variant="outline" onClick={() => open(index)} loading={busyIndex === index} aria-label={`Download ${file.originalName}`}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Download
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function QuoteView({ quote }) {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const update = useUpdateQuote();
  const remove = useDeleteQuote();
  const [notes, setNotes] = useState(quote.notes ?? '');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const save = (changes, successMessage) =>
    update.mutate(
      { id: quote._id, changes },
      {
        onSuccess: () => toast.success(successMessage),
        onError: (error) => toast.error(getApiError(error).message),
      }
    );

  const changeStatus = (event) => save({ status: event.target.value }, `Marked as ${statusLabel[event.target.value].toLowerCase()}`);
  const saveNotes = () => save({ notes: notes.trim() }, 'Notes saved');
  const notesChanged = notes.trim() !== (quote.notes ?? '');

  const confirmDelete = async () => {
    try {
      await remove.mutateAsync(quote._id);
      toast.success('Quote request deleted');
      navigate('/admin/quotes', { replace: true });
    } catch (error) {
      setConfirmingDelete(false);
      toast.error(getApiError(error).message);
    }
  };

  const typeLabel = labelOf(projectTypes, quote.projectType);
  const replyLink = `mailto:${quote.email}?subject=${encodeURIComponent(`Your ${typeLabel.toLowerCase()} project with Stackwell`)}`;

  return (
    <>
      <Seo title={`Quote request from ${quote.name}`} noindex />
      <Link to="/admin/quotes" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to quote requests
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="break-words text-h2">{typeLabel}</h1>
          <p className="mt-1 text-slate-600">
            From {quote.name}, received{' '}
            <time dateTime={quote.createdAt} title={formatDateTime(quote.createdAt)}>
              {timeAgo(quote.createdAt)}
            </time>
          </p>
        </div>
        <Badge variant={statusVariant[quote.status]}>{statusLabel[quote.status]}</Badge>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <Card>
            <h2 className="text-lg">Project</h2>
            <dl className="mt-3 grid gap-4 sm:grid-cols-2">
              <Detail label="Type">{typeLabel}</Detail>
              <Detail label="Budget">{labelOf(budgetRanges, quote.budgetRange)}</Detail>
              <Detail label="Timeline">{labelOf(timelines, quote.timeline)}</Detail>
              <Detail label="Services of interest">
                {quote.services.length ? (
                  <span className="flex flex-wrap gap-2">
                    {quote.services.map((service) => (
                      <Badge key={service._id}>{service.title}</Badge>
                    ))}
                  </span>
                ) : (
                  <span className="font-normal text-slate-500">None chosen</span>
                )}
              </Detail>
            </dl>
            <h3 className="mt-6 text-base">Description</h3>
            <p className="mt-2 whitespace-pre-line break-words text-slate-700">{quote.description}</p>
          </Card>

          <Attachments quote={quote} />

          <Card>
            <h2 className="text-lg">Contact details</h2>
            <dl className="mt-3 grid gap-4 sm:grid-cols-2">
              <Detail label="Name">{quote.name}</Detail>
              <Detail label="Email">
                <a href={`mailto:${quote.email}`} className="break-all text-brand-700 hover:underline">
                  {quote.email}
                </a>
              </Detail>
              {quote.phone && (
                <Detail label="Phone">
                  <a href={`tel:${quote.phone.replace(/[^\d+]/g, '')}`} className="text-brand-700 hover:underline">
                    {quote.phone}
                  </a>
                </Detail>
              )}
              {quote.company && <Detail label="Company">{quote.company}</Detail>}
            </dl>
            <Button as="a" href={replyLink} className="mt-5">
              <Mail className="h-4 w-4" aria-hidden="true" />
              Reply by email
            </Button>
          </Card>
        </div>

        <div className="min-w-0 space-y-6">
          <Card>
            <Select label="Pipeline status" value={quote.status} onChange={changeStatus} disabled={update.isPending}>
              {QUOTE_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {statusLabel[value]}
                </option>
              ))}
            </Select>
          </Card>

          <Card>
            <Textarea
              label="Internal notes"
              hint={`Only your team sees these. ${notes.length}/${NOTES_MAX}`}
              rows={5}
              maxLength={NOTES_MAX}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
            <Button className="mt-4" onClick={saveNotes} disabled={!notesChanged} loading={update.isPending && update.variables?.changes?.notes !== undefined}>
              Save notes
            </Button>
          </Card>

          {user.role === 'admin' && (
            <Card>
              <h2 className="text-lg">Delete</h2>
              <p className="mt-1 text-sm text-slate-600">Removes this request and its attached files for good. This cannot be undone.</p>
              <Button variant="danger" className="mt-4" onClick={() => setConfirmingDelete(true)}>
                Delete quote request
              </Button>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this quote request?"
        message={`The request from ${quote.name} and any attached files will be permanently deleted.`}
        loading={remove.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </>
  );
}

export default function QuoteDetail() {
  const { id } = useParams();
  const query = useQuote(id);

  return (
    <DetailPageState
      query={query}
      loadingLabel="Loading quote request"
      errorTitle="We could not load this quote request"
      notFound={{
        title: 'Quote request not found',
        description: 'It may have been deleted.',
        backTo: '/admin/quotes',
        backLabel: 'Back to quote requests',
      }}
    >
      {(quote) => <QuoteView key={quote._id} quote={quote} />}
    </DetailPageState>
  );
}
