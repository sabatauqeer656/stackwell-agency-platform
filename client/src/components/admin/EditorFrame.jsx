import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Seo from '../Seo.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';

/**
 * The frame around an add / edit form: back link, heading, the <form> with its Save bar, the delete card and
 * the two confirmation dialogs. `editor` comes from useRecordEditor. The fields themselves are the `children`.
 *   config   - noun, Noun, plural, adminPath (see useRecordEditor), optional: backLabel, createLabel, deleteLabel
 *   title    - the heading of an existing record (editing). Creating shows "New <noun>".
 *   published - true / false, shows a Published / Draft badge when editing
 *   intro    - the sentence under the heading
 */
export default function EditorFrame({ editor, config, title, published, intro, children }) {
  const { noun, plural, adminPath } = config;
  const { isEdit, isDirty, isSubmitting } = editor;
  const backLabel = config.backLabel ?? `Back to ${plural}`;
  const createLabel = config.createLabel ?? `Create ${noun}`;

  return (
    <>
      <Seo title={isEdit ? `Edit ${title}` : `New ${noun}`} noindex />
      <Link to={adminPath} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {backLabel}
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="break-words text-h2">{isEdit ? title : `New ${noun}`}</h1>
          <p className="mt-1 text-slate-600">{intro}</p>
        </div>
        {isEdit && <Badge variant={published ? 'success' : 'warning'}>{published ? 'Published' : 'Draft'}</Badge>}
      </div>

      <form onSubmit={editor.submit} noValidate className="mt-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {children}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button type="submit" loading={isSubmitting} disabled={isEdit && !isDirty}>
            {isEdit ? 'Save changes' : createLabel}
          </Button>
          <Button as={Link} to={adminPath} variant="ghost">
            {isDirty ? 'Cancel' : 'Back'}
          </Button>
          {isEdit && isDirty && <span className="text-sm text-slate-500">You have unsaved changes.</span>}
        </div>
      </form>

      <ConfirmDialog
        open={editor.confirmingDelete}
        title={`Delete this ${noun}?`}
        message={isEdit ? `"${title}" will be permanently deleted and removed from the website.` : ''}
        loading={editor.deleting}
        onConfirm={editor.confirmDelete}
        onCancel={() => editor.setConfirmingDelete(false)}
      />
      <ConfirmDialog
        open={editor.blocker.state === 'blocked'}
        title="Leave without saving?"
        message={`Your changes to this ${noun} have not been saved.`}
        confirmLabel="Leave"
        // proceed/reset only exist while a navigation is actually blocked, and the dialog can also call onCancel as it closes
        onConfirm={() => editor.blocker.proceed?.()}
        onCancel={() => editor.blocker.reset?.()}
      />
    </>
  );
}

// The "Delete" card for the right-hand column of a form. Shows nothing unless the person may delete
// (administrators, on an existing record). `text` explains what deleting does.
export function DeleteCard({ editor, config, text }) {
  if (!editor.canDelete) return null;
  return (
    <Card>
      <h2 className="text-lg">Delete</h2>
      <p className="mt-1 text-sm text-slate-600">{text}</p>
      <Button type="button" variant="danger" className="mt-4" onClick={() => editor.setConfirmingDelete(true)}>
        {config.deleteLabel ?? `Delete ${config.noun}`}
      </Button>
    </Card>
  );
}
