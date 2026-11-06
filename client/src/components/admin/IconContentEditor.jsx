import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Seo from '../Seo.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import StringListField from './StringListField.jsx';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import Checkbox from '../ui/Checkbox.jsx';
import DetailPageState from '../ui/DetailPageState.jsx';
import DynamicIcon, { iconNames } from '../ui/DynamicIcon.jsx';
import Input from '../ui/Input.jsx';
import Select from '../ui/Select.jsx';
import Textarea from '../ui/Textarea.jsx';
import {
  FIELD_ERRORS_FROM_SERVER,
  LIST_MAX,
  createIconContentSchemas,
  emptyIconContent,
  toFormValues,
  toPayload,
} from '../../features/admin/iconContentSchema.js';
import { useUnsavedGuard } from '../../features/admin/useUnsavedGuard.js';
import { useAuth } from '../../features/auth/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { getApiError } from '../../lib/apiErrors.js';

// One form for both jobs: creating a record (no `item`) and editing one.
// `config` (features/admin/contentConfigs.js) says whether this is a service or a solution.
function IconContentForm({ config, item }) {
  const { noun, Noun, adminPath, publicPath, listKey } = config;
  const isEdit = Boolean(item);
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const create = config.hooks.useCreate();
  const update = config.hooks.useUpdate();
  const remove = config.hooks.useDelete();
  const schemas = useMemo(() => createIconContentSchemas(config.listItemMax), [config.listItemMax]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    setFocus,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({
    resolver: zodResolver(isEdit ? schemas.edit : schemas.create),
    defaultValues: item ? toFormValues(item, listKey) : emptyIconContent(config.defaultIcon),
    mode: 'onTouched', // an error appears when you leave a field, and goes away as soon as it is fixed
  });
  const { fields, append, remove: removeListEntry } = useFieldArray({ control, name: 'list' });

  const icon = watch('icon');
  const summaryLength = watch('summary').length;
  const descriptionLength = watch('description').length;
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const { blocker, allowLeave } = useUnsavedGuard(isDirty);

  const onSubmit = async (values) => {
    const payload = toPayload(values, listKey, { includeEmptySlug: isEdit });
    try {
      if (isEdit) {
        const saved = await update.mutateAsync({ id: item._id, changes: payload });
        reset(toFormValues(saved, listKey)); // the form now matches what is stored, so it is "clean" again
        toast.success(saved.slug === payload.slug ? `${Noun} saved` : `Saved. That address was taken, so it is now ${publicPath}/${saved.slug}`);
      } else {
        const saved = await create.mutateAsync(payload);
        toast.success(`${Noun} created`);
        allowLeave.current = true;
        navigate(`${adminPath}/${saved._id}`, { replace: true });
      }
    } catch (error) {
      const { message, details } = getApiError(error);
      const fieldErrors = details.filter((detail) => FIELD_ERRORS_FROM_SERVER.includes(detail.field));
      fieldErrors.forEach((detail) => setError(detail.field, { type: 'server', message: detail.message }));
      if (fieldErrors.length > 0) setFocus(fieldErrors[0].field);
      else toast.error(message);
    }
  };

  const confirmDelete = async () => {
    try {
      await remove.mutateAsync(item._id);
      toast.success(`${Noun} deleted`);
      allowLeave.current = true;
      navigate(adminPath, { replace: true });
    } catch (error) {
      setConfirmingDelete(false);
      toast.error(getApiError(error).message); // e.g. "This solution is used by 2 projects. Move or delete them first."
    }
  };

  // An icon saved earlier that is no longer in the list is still shown, so opening the form never changes it silently.
  const iconChoices = iconNames.includes(icon) || !icon ? iconNames : [icon, ...iconNames];

  return (
    <>
      <Seo title={isEdit ? `Edit ${item.title}` : `New ${noun}`} noindex />
      <Link to={adminPath} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to {config.plural}
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="break-words text-h2">{isEdit ? item.title : `New ${noun}`}</h1>
          <p className="mt-1 text-slate-600">{isEdit ? 'Changes appear on the website as soon as you save.' : 'Fill in the details. Nothing is public until it is published.'}</p>
        </div>
        {isEdit && (
          <div className="flex items-center gap-3">
            <Badge variant={item.isPublished ? 'success' : 'warning'}>{item.isPublished ? 'Published' : 'Draft'}</Badge>
            {item.isPublished && (
              <a href={`${publicPath}/${item.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
                View on site
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="min-w-0 space-y-6 lg:col-span-2">
            <Card className="space-y-5">
              <h2 className="text-lg">Content</h2>
              <Input label="Title" required maxLength={100} error={errors.title?.message} {...register('title')} />
              <Textarea
                label="Summary"
                required
                rows={2}
                maxLength={200}
                hint={`${config.summaryHint} ${summaryLength}/200`}
                error={errors.summary?.message}
                {...register('summary')}
              />
              <Textarea
                label="Description"
                required
                rows={8}
                maxLength={5000}
                hint={`${config.descriptionHint} ${descriptionLength}/5000`}
                error={errors.description?.message}
                {...register('description')}
              />
            </Card>

            <Card>
              <StringListField
                label={config.listLabel}
                hint={config.listHint}
                name="list"
                fields={fields}
                register={register}
                errors={errors.list}
                append={append}
                remove={removeListEntry}
                max={LIST_MAX}
                itemMax={config.listItemMax}
                placeholder={config.listPlaceholder}
                addLabel={config.listAddLabel}
              />
            </Card>
          </div>

          <div className="min-w-0 space-y-6">
            <Card className="space-y-5">
              <h2 className="text-lg">Publishing</h2>
              <Checkbox label="Published" hint="Untick to keep it as a draft that visitors cannot see." {...register('isPublished')} />
              <Input
                label="Order"
                type="number"
                inputMode="numeric"
                min={0}
                max={999}
                hint="Lower numbers come first."
                error={errors.order?.message}
                {...register('order', { valueAsNumber: true })}
              />
              <Input
                label="Web address"
                maxLength={100}
                spellCheck={false}
                hint={isEdit ? 'Changing this changes the page address, so old links to it stop working.' : 'Leave empty to create it from the title.'}
                error={errors.slug?.message}
                {...register('slug')}
              />
            </Card>

            <Card>
              <div className="flex items-end gap-3">
                <Select label="Icon" className="min-w-0 flex-1" error={errors.icon?.message} {...register('icon')}>
                  {iconChoices.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </Select>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700" aria-hidden="true">
                  <DynamicIcon name={icon} className="h-5 w-5" />
                </span>
              </div>
            </Card>

            {/* Only administrators may delete (the API enforces it too). Editors never see this card. */}
            {isEdit && user.role === 'admin' && (
              <Card>
                <h2 className="text-lg">Delete</h2>
                <p className="mt-1 text-sm text-slate-600">Removes this {noun} for good. To only hide it, untick Published instead.</p>
                <Button type="button" variant="danger" className="mt-4" onClick={() => setConfirmingDelete(true)}>
                  Delete {noun}
                </Button>
              </Card>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button type="submit" loading={isSubmitting} disabled={isEdit && !isDirty}>
            {isEdit ? 'Save changes' : `Create ${noun}`}
          </Button>
          <Button as={Link} to={adminPath} variant="ghost">
            {isDirty ? 'Cancel' : 'Back'}
          </Button>
          {isEdit && isDirty && <span className="text-sm text-slate-500">You have unsaved changes.</span>}
        </div>
      </form>

      <ConfirmDialog
        open={confirmingDelete}
        title={`Delete this ${noun}?`}
        message={isEdit ? `"${item.title}" will be permanently deleted and removed from the website.` : ''}
        loading={remove.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
      <ConfirmDialog
        open={blocker.state === 'blocked'}
        title="Leave without saving?"
        message={`Your changes to this ${noun} have not been saved.`}
        confirmLabel="Leave"
        // proceed/reset only exist while a navigation is actually blocked, and the dialog can also call onCancel as it closes
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />
    </>
  );
}

function EditLoader({ config, id }) {
  const query = config.hooks.useOne(id);
  return (
    <DetailPageState
      query={query}
      loadingLabel={`Loading ${config.noun}`}
      errorTitle={`We could not load this ${config.noun}`}
      notFound={{ title: `${config.Noun} not found`, description: 'It may have been deleted.', backTo: config.adminPath, backLabel: `Back to ${config.plural}` }}
    >
      {/* key: opening a different record starts with a fresh form */}
      {(item) => <IconContentForm key={item._id} config={config} item={item} />}
    </DetailPageState>
  );
}

// The page for /new (no id in the address) and for /:id
export default function IconContentEditor({ config }) {
  const { id } = useParams();
  return id ? <EditLoader config={config} id={id} /> : <IconContentForm config={config} />;
}
