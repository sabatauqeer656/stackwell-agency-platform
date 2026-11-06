import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Seo from '../../components/Seo.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import ImageField from '../../components/admin/ImageField.jsx';
import ImageListField from '../../components/admin/ImageListField.jsx';
import StringListField from '../../components/admin/StringListField.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Checkbox from '../../components/ui/Checkbox.jsx';
import DetailPageState from '../../components/ui/DetailPageState.jsx';
import Input from '../../components/ui/Input.jsx';
import QueryState from '../../components/ui/QueryState.jsx';
import Select from '../../components/ui/Select.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import { useAdminProject, useCreateProject, useDeleteProject, useSolutionChoices, useUpdateProject } from '../../features/admin/projects.js';
import {
  GALLERY_MAX,
  PROJECT_FIELD_ERRORS_FROM_SERVER,
  RESULTS_MAX,
  RESULT_ITEM_MAX,
  TECH_ITEM_MAX,
  TECH_MAX,
  createProjectFormSchema,
  editProjectFormSchema,
  emptyProject,
  toFormValues,
  toPayload,
} from '../../features/admin/projectSchema.js';
import { useUnsavedGuard } from '../../features/admin/useUnsavedGuard.js';
import { useAuth } from '../../features/auth/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { getApiError } from '../../lib/apiErrors.js';

// One form for both jobs: creating a project (no `project`) and editing one.
// `solutions` is the list for the dropdown. It is loaded BEFORE the form appears, so the saved choice is selected from the start.
function ProjectForm({ project, solutions }) {
  const isEdit = Boolean(project);
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const create = useCreateProject();
  const update = useUpdateProject();
  const remove = useDeleteProject();

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
    resolver: zodResolver(isEdit ? editProjectFormSchema : createProjectFormSchema),
    defaultValues: project ? toFormValues(project) : emptyProject,
    mode: 'onTouched',
  });
  const resultsList = useFieldArray({ control, name: 'results' });
  const techList = useFieldArray({ control, name: 'techStack' });

  const summaryLength = watch('summary').length;
  const challengeLength = watch('challenge').length;
  const approachLength = watch('approach').length;
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const { blocker, allowLeave } = useUnsavedGuard(isDirty);

  const onSubmit = async (values) => {
    const payload = toPayload(values, { isEdit });
    try {
      if (isEdit) {
        const saved = await update.mutateAsync({ id: project._id, changes: payload });
        reset(toFormValues(saved));
        toast.success(saved.slug === payload.slug ? 'Project saved' : `Saved. That address was taken, so it is now /projects/${saved.slug}`);
      } else {
        const saved = await create.mutateAsync(payload);
        toast.success('Project created');
        allowLeave.current = true;
        navigate(`/admin/projects/${saved._id}`, { replace: true });
      }
    } catch (error) {
      const { message, details } = getApiError(error);
      const fieldErrors = details.filter((detail) => PROJECT_FIELD_ERRORS_FROM_SERVER.includes(detail.field));
      fieldErrors.forEach((detail) => setError(detail.field, { type: 'server', message: detail.message }));
      if (fieldErrors.length > 0) setFocus(fieldErrors[0].field);
      else toast.error(message);
    }
  };

  const confirmDelete = async () => {
    try {
      await remove.mutateAsync(project._id);
      toast.success('Project deleted');
      allowLeave.current = true;
      navigate('/admin/projects', { replace: true });
    } catch (error) {
      setConfirmingDelete(false);
      toast.error(getApiError(error).message);
    }
  };

  return (
    <>
      <Seo title={isEdit ? `Edit ${project.title}` : 'New project'} noindex />
      <Link to="/admin/projects" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to projects
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="break-words text-h2">{isEdit ? project.title : 'New project'}</h1>
          <p className="mt-1 text-slate-600">{isEdit ? 'Changes appear on the website as soon as you save.' : 'Fill in the case study. Nothing is public until it is published.'}</p>
        </div>
        {isEdit && (
          <div className="flex items-center gap-3">
            <Badge variant={project.isPublished ? 'success' : 'warning'}>{project.isPublished ? 'Published' : 'Draft'}</Badge>
            {project.isPublished && (
              <a href={`/projects/${project.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
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
              <h2 className="text-lg">Case study</h2>
              <Input label="Title" required maxLength={100} error={errors.title?.message} {...register('title')} />
              <Input label="Client name" required maxLength={100} error={errors.clientName?.message} {...register('clientName')} />
              <Textarea
                label="Summary"
                required
                rows={2}
                maxLength={200}
                hint={`One or two sentences shown on the project cards. ${summaryLength}/200`}
                error={errors.summary?.message}
                {...register('summary')}
              />
              <Textarea
                label="The challenge"
                required
                rows={6}
                maxLength={3000}
                hint={`What problem did the client have? ${challengeLength}/3000`}
                error={errors.challenge?.message}
                {...register('challenge')}
              />
              <Textarea
                label="Our approach"
                required
                rows={6}
                maxLength={3000}
                hint={`How did you solve it? ${approachLength}/3000`}
                error={errors.approach?.message}
                {...register('approach')}
              />
            </Card>

            <Card>
              <StringListField
                label="Results"
                hint="Measurable outcomes. Press Enter to add another."
                name="results"
                fields={resultsList.fields}
                register={register}
                errors={errors.results}
                append={resultsList.append}
                remove={resultsList.remove}
                max={RESULTS_MAX}
                itemMax={RESULT_ITEM_MAX}
                placeholder="For example: Checkout time cut by 40%"
                addLabel="Add a result"
              />
            </Card>

            <Card>
              <StringListField
                label="Tech stack"
                hint="Technologies used, one per row."
                name="techStack"
                fields={techList.fields}
                register={register}
                errors={errors.techStack}
                append={techList.append}
                remove={techList.remove}
                max={TECH_MAX}
                itemMax={TECH_ITEM_MAX}
                placeholder="For example: React"
                addLabel="Add a technology"
              />
            </Card>

            <Card className="space-y-8">
              <h2 className="text-lg">Images</h2>
              <Controller
                control={control}
                name="coverImage"
                render={({ field }) => (
                  <ImageField label="Cover image" value={field.value} onChange={field.onChange} error={errors.coverImage?.message} hint="Shown on the project card and at the top of the case study." />
                )}
              />
              <Controller
                control={control}
                name="images"
                render={({ field }) => (
                  <ImageListField label="Gallery" value={field.value} onChange={field.onChange} max={GALLERY_MAX} hint="More pictures shown on the case study." />
                )}
              />
            </Card>
          </div>

          <div className="min-w-0 space-y-6">
            <Card className="space-y-5">
              <h2 className="text-lg">Publishing</h2>
              <Checkbox label="Published" hint="Untick to keep it as a draft that visitors cannot see." {...register('isPublished')} />
              <Checkbox label="Featured" hint="Show it on the home page." {...register('isFeatured')} />
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

            <Card className="space-y-5">
              <h2 className="text-lg">Details</h2>
              <Select label="Solution" required error={errors.solution?.message} {...register('solution')}>
                <option value="">Choose a solution…</option>
                {solutions.map((solution) => (
                  <option key={solution._id} value={solution._id}>
                    {solution.title}
                    {solution.isPublished ? '' : ' (draft)'}
                  </option>
                ))}
              </Select>
              <Input label="Completed on" type="date" hint="Optional." error={errors.completedAt?.message} {...register('completedAt')} />
              <Input label="Live website" type="url" inputMode="url" spellCheck={false} hint="Optional. A link to the finished product." placeholder="https://" error={errors.liveUrl?.message} {...register('liveUrl')} />
            </Card>

            {/* Only administrators may delete (the API enforces it too). Editors never see this card. */}
            {isEdit && user.role === 'admin' && (
              <Card>
                <h2 className="text-lg">Delete</h2>
                <p className="mt-1 text-sm text-slate-600">Removes this project for good. To only hide it, untick Published instead.</p>
                <Button type="button" variant="danger" className="mt-4" onClick={() => setConfirmingDelete(true)}>
                  Delete project
                </Button>
              </Card>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button type="submit" loading={isSubmitting} disabled={isEdit && !isDirty}>
            {isEdit ? 'Save changes' : 'Create project'}
          </Button>
          <Button as={Link} to="/admin/projects" variant="ghost">
            {isDirty ? 'Cancel' : 'Back'}
          </Button>
          {isEdit && isDirty && <span className="text-sm text-slate-500">You have unsaved changes.</span>}
        </div>
      </form>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this project?"
        message={isEdit ? `"${project.title}" will be permanently deleted and removed from the website.` : ''}
        loading={remove.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
      <ConfirmDialog
        open={blocker.state === 'blocked'}
        title="Leave without saving?"
        message="Your changes to this project have not been saved."
        confirmLabel="Leave"
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />
    </>
  );
}

function EditLoader({ id, solutions }) {
  const query = useAdminProject(id);
  return (
    <DetailPageState
      query={query}
      loadingLabel="Loading project"
      errorTitle="We could not load this project"
      notFound={{ title: 'Project not found', description: 'It may have been deleted.', backTo: '/admin/projects', backLabel: 'Back to projects' }}
    >
      {(project) => <ProjectForm key={project._id} project={project} solutions={solutions} />}
    </DetailPageState>
  );
}

function ChoicesSkeleton() {
  return (
    <div aria-busy="true" className="space-y-4">
      <p role="status" className="sr-only">
        Loading the form
      </p>
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

// The page for /new (no id in the address) and for /:id
export default function ProjectEdit() {
  const { id } = useParams();
  const choices = useSolutionChoices();

  return (
    <QueryState
      query={choices}
      skeleton={<ChoicesSkeleton />}
      errorTitle="We could not load the solutions"
      emptyTitle="Add a solution first"
      emptyDescription="Every project belongs to a solution (an industry). Create one under Solutions, then come back."
    >
      {(solutions) => (id ? <EditLoader id={id} solutions={solutions} /> : <ProjectForm solutions={solutions} />)}
    </QueryState>
  );
}
