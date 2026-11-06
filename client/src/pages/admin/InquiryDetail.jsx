import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import Seo from '../../components/Seo.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import DetailPageState from '../../components/ui/DetailPageState.jsx';
import Select from '../../components/ui/Select.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import { INQUIRY_STATUSES, useDeleteInquiry, useInquiry, useUpdateInquiry } from '../../features/admin/inquiries.js';
import { statusLabel, statusVariant } from '../../features/admin/statusStyles.js';
import { useAuth } from '../../features/auth/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { getApiError } from '../../lib/apiErrors.js';
import { formatDateTime, timeAgo } from '../../lib/format.js';

const NOTES_MAX = 2000;

function InquiryView({ inquiry }) {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const update = useUpdateInquiry();
  const remove = useDeleteInquiry();
  const [notes, setNotes] = useState(inquiry.notes ?? '');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Opening a NEW inquiry marks it as read, like an email inbox. Done once, quietly (no toast).
  // The ref stops React's development double-run from sending it twice.
  const markedRead = useRef(false);
  const { mutate } = update;
  useEffect(() => {
    if (inquiry.status === 'new' && !markedRead.current) {
      markedRead.current = true;
      mutate({ id: inquiry._id, changes: { status: 'read' } });
    }
  }, [inquiry._id, inquiry.status, mutate]);

  const save = (changes, successMessage) =>
    update.mutate(
      { id: inquiry._id, changes },
      {
        onSuccess: () => toast.success(successMessage),
        onError: (error) => toast.error(getApiError(error).message),
      }
    );

  const changeStatus = (event) => save({ status: event.target.value }, `Marked as ${statusLabel[event.target.value].toLowerCase()}`);
  const saveNotes = () => save({ notes: notes.trim() }, 'Notes saved');
  const notesChanged = notes.trim() !== (inquiry.notes ?? '');

  const confirmDelete = async () => {
    try {
      await remove.mutateAsync(inquiry._id);
      toast.success('Inquiry deleted');
      navigate('/admin/inquiries', { replace: true });
    } catch (error) {
      setConfirmingDelete(false);
      toast.error(getApiError(error).message);
    }
  };

  const replyLink = `mailto:${inquiry.email}?subject=${encodeURIComponent(`Re: ${inquiry.subject}`)}`;

  return (
    <>
      <Seo title={`Inquiry from ${inquiry.name}`} noindex />
      <Link to="/admin/inquiries" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to inquiries
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="break-words text-h2">{inquiry.subject}</h1>
          <p className="mt-1 text-slate-600">
            From {inquiry.name}, received{' '}
            <time dateTime={inquiry.createdAt} title={formatDateTime(inquiry.createdAt)}>
              {timeAgo(inquiry.createdAt)}
            </time>
          </p>
        </div>
        <Badge variant={statusVariant[inquiry.status]}>{statusLabel[inquiry.status]}</Badge>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <Card>
            <h2 className="text-lg">Message</h2>
            <p className="mt-3 whitespace-pre-line break-words text-slate-700">{inquiry.message}</p>
          </Card>

          <Card>
            <h2 className="text-lg">Contact details</h2>
            <dl className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-slate-500">Name</dt>
                <dd className="break-words font-medium text-ink">{inquiry.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Email</dt>
                <dd className="break-all font-medium">
                  <a href={`mailto:${inquiry.email}`} className="text-brand-700 hover:underline">
                    {inquiry.email}
                  </a>
                </dd>
              </div>
              {inquiry.phone && (
                <div>
                  <dt className="text-sm text-slate-500">Phone</dt>
                  <dd className="font-medium">
                    <a href={`tel:${inquiry.phone.replace(/[^\d+]/g, '')}`} className="text-brand-700 hover:underline">
                      {inquiry.phone}
                    </a>
                  </dd>
                </div>
              )}
              {inquiry.company && (
                <div>
                  <dt className="text-sm text-slate-500">Company</dt>
                  <dd className="break-words font-medium text-ink">{inquiry.company}</dd>
                </div>
              )}
            </dl>
            <Button as="a" href={replyLink} className="mt-5">
              <Mail className="h-4 w-4" aria-hidden="true" />
              Reply by email
            </Button>
          </Card>
        </div>

        <div className="min-w-0 space-y-6">
          <Card>
            <Select label="Status" value={inquiry.status} onChange={changeStatus} disabled={update.isPending}>
              {INQUIRY_STATUSES.map((value) => (
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

          {/* Only administrators may delete (the API enforces it too). Editors never see this card. */}
          {user.role === 'admin' && (
            <Card>
              <h2 className="text-lg">Delete</h2>
              <p className="mt-1 text-sm text-slate-600">Removes this inquiry for good. This cannot be undone.</p>
              <Button variant="danger" className="mt-4" onClick={() => setConfirmingDelete(true)}>
                Delete inquiry
              </Button>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this inquiry?"
        message={`The message from ${inquiry.name} will be permanently deleted.`}
        loading={remove.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </>
  );
}

export default function InquiryDetail() {
  const { id } = useParams();
  const query = useInquiry(id);

  return (
    <DetailPageState
      query={query}
      loadingLabel="Loading inquiry"
      errorTitle="We could not load this inquiry"
      notFound={{
        title: 'Inquiry not found',
        description: 'It may have been deleted.',
        backTo: '/admin/inquiries',
        backLabel: 'Back to inquiries',
      }}
    >
      {/* key: opening a different inquiry starts with fresh notes and a fresh "mark as read" */}
      {(inquiry) => <InquiryView key={inquiry._id} inquiry={inquiry} />}
    </DetailPageState>
  );
}
