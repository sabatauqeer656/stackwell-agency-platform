import { useEffect, useRef, useState } from 'react';
import { Link, useBlocker, useNavigate, useParams } from 'react-router-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Seo from '../../components/Seo.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import StringListField from '../../components/admin/StringListField.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Checkbox from '../../components/ui/Checkbox.jsx';
import DetailPageState from '../../components/ui/DetailPageState.jsx';
import DynamicIcon from '../../components/ui/DynamicIcon.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import { useAdminService, useCreateService, useDeleteService, useUpdateService } from '../../features/admin/services.js';
import {
  SERVICE_FEATURES_MAX,
  createServiceFormSchema,
  editServiceFormSchema,
  emptyService,
  iconNames,
  toFormValues,
  toPayload,
} from '../../features/admin/serviceSchema.js';
import { useAuth } from '../../features/auth/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { getApiError } from '../../lib/apiErrors.js';

// Server complaints about these fields are shown next to the field. (Anything else becomes a toast.)
const FIELD_ERRORS_FROM_SERVER = ['title', 'slug', 'summary', 'description', 'icon', 'order'];

// One form for both jobs: creating a service (no `service`) and editing one.
function ServiceForm({ service }) {
  const isEdit = Boolean(service);
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const create = useCreateService();
  const update = useUpdateService();
  const remove = useDeleteService();

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
    resolver: zodResolver(isEdit ? editServiceFormSchema : createServiceFormSchema),
    defaultValues: service ? toFormValues(service) : emptyService,
    mode: 'onTouched', // an error appears when you leave a field, and goes away as soon as it is fixed
  });
  const { fields, append, remove: removeFeature } = useFieldArray({ control, name: 'features' });

  const icon = watch('icon');
  const summaryLength = watch('summary').length;
  const descriptionLength = watch('description').length;
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Leaving with unsaved changes asks first. After a successful save or delete we leave on purpose, so the guard steps aside.
  const allowLeave = useRef(false);
  const blocker = useBlocker(({ currentLocation, nextLocation }) => isDirty && !allowLeave.current && currentLocation.pathname !== nextLocation.pathname);
  useEffect(() => {
    if (!isDirty) return undefined;
    const warn = (event) => event.preventDefault(); // closing the tab or reloading: the browser shows its own warning
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  const onSubmit = async (values) => {
    const payload = toPayload(values, { includeEmptySlug: isEdit });
    try {
      if (isEdit) {
        const saved = await update.mutateAsync({ id: service._id, changes: payload });
        reset(toFormValues(saved)); // the form now matches what is stored, so it is "clean" again
        toast.success(saved.slug === payload.slug ? 'Service saved' : `Saved. That address was taken, so it is now /services/${saved.slug}`);
      } else {
        const saved = await create.mutateAsync(payload);
        toast.success('Service created');
        allowLeave.current = true;
        navigate(`/admin/services/${saved._id}`, { replace: true });
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
      await remove.mutateAsync(service._id);
      toast.success('Service deleted');
      allowLeave.current = true;
      navigate('/admin/services', { replace: true });
    } catch (error) {
      setConfirmingDelete(false);
      toast.error(getApiError(error).message);
    }
  };

  // An icon saved earlier that is no longer in the list is still shown, so opening the form never changes it silently.
  const iconChoices = iconNames.includes(icon) || !icon ? iconNames : [icon, ...iconNames];

  return (
    <>
      <Seo title={isEdit ? `Edit ${service.title}` : 'New service'} noindex />
      <Link to="/admin/services" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to services
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="break-words text-h2">{isEdit ? service.title : 'New service'}</h1>
          <p className="mt-1 text-slate-600">{isEdit ? 'Changes appear on the website as soon as you save.' : 'Fill in the details. Nothing is public until it is published.'}</p>
        </div>
        {isEdit && (
          <div className="flex items-center gap-3">
            <Badge variant={service.isPublished ? 'success' : 'warning'}>{service.isPublished ? 'Published' : 'Draft'}</Badge>
            {service.isPublished && (
              <a href={`/services/${service.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
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
                hint={`One or two sentences shown on the service cards. ${summaryLength}/200`}
                error={errors.summary?.message}
                {...register('summary')}
              />
              <Textarea
                label="Description"
                required
                rows={8}
                maxLength={5000}
                hint={`Shown on the service's own page. A blank line starts a new paragraph. ${descriptionLength}/5000`}
                error={errors.description?.message}
                {...register('description')}
              />
            </Card>

            <Card>
              <StringListField
                label="Key features"
                hint="Short bullet points shown on the service page. Press Enter to add another."
                name="features"
                fields={fields}
                register={register}
                errors={errors.features}
                append={append}
                remove={removeFeature}
                max={SERVICE_FEATURES_MAX}
                placeholder="For example: Single-page apps with React"
                addLabel="Add a feature"
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
                <p className="mt-1 text-sm text-slate-600">Removes this service for good. To only hide it, untick Published instead.</p>
                <Button type="button" variant="danger" className="mt-4" onClick={() => setConfirmingDelete(true)}>
                  Delete service
                </Button>
              </Card>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button type="submit" loading={isSubmitting} disabled={isEdit && !isDirty}>
            {isEdit ? 'Save changes' : 'Create service'}
          </Button>
          <Button as={Link} to="/admin/services" variant="ghost">
            {isDirty ? 'Cancel' : 'Back'}
          </Button>
          {isEdit && isDirty && <span className="text-sm text-slate-500">You have unsaved changes.</span>}
        </div>
      </form>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this service?"
        message={isEdit ? `"${service.title}" will be permanently deleted and removed from the website.` : ''}
        loading={remove.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
      <ConfirmDialog
        open={blocker.state === 'blocked'}
        title="Leave without saving?"
        message="Your changes to this service have not been saved."
        confirmLabel="Leave"
        // proceed/reset only exist while a navigation is actually blocked, and the dialog can also call onCancel as it closes
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />
    </>
  );
}

function EditLoader({ id }) {
  const query = useAdminService(id);
  return (
    <DetailPageState
      query={query}
      loadingLabel="Loading service"
      errorTitle="We could not load this service"
      notFound={{ title: 'Service not found', description: 'It may have been deleted.', backTo: '/admin/services', backLabel: 'Back to services' }}
    >
      {/* key: opening a different service starts with a fresh form */}
      {(service) => <ServiceForm key={service._id} service={service} />}
    </DetailPageState>
  );
}

export default function ServiceEdit() {
  const { id } = useParams();
  return id ? <EditLoader id={id} /> : <ServiceForm />;
}
