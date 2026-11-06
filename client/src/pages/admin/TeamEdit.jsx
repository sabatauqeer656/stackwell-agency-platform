import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import Seo from '../../components/Seo.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import ImageField from '../../components/admin/ImageField.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Checkbox from '../../components/ui/Checkbox.jsx';
import DetailPageState from '../../components/ui/DetailPageState.jsx';
import Input from '../../components/ui/Input.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import { useAdminTeamMember, useCreateTeamMember, useDeleteTeamMember, useUpdateTeamMember } from '../../features/admin/team.js';
import {
  BIO_MAX,
  TEAM_FIELD_ERRORS_FROM_SERVER,
  emptyTeamMember,
  teamFormSchema,
  toFormValues,
  toPayload,
} from '../../features/admin/teamSchema.js';
import { useUnsavedGuard } from '../../features/admin/useUnsavedGuard.js';
import { useAuth } from '../../features/auth/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { getApiError } from '../../lib/apiErrors.js';

// One form for both jobs: adding a team member (no `member`) and editing one.
function TeamForm({ member }) {
  const isEdit = Boolean(member);
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const create = useCreateTeamMember();
  const update = useUpdateTeamMember();
  const remove = useDeleteTeamMember();

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
    resolver: zodResolver(teamFormSchema),
    defaultValues: member ? toFormValues(member) : emptyTeamMember,
    mode: 'onTouched',
  });

  const name = watch('name');
  const bioLength = watch('bio').length;
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const { blocker, allowLeave } = useUnsavedGuard(isDirty);

  const onSubmit = async (values) => {
    const payload = toPayload(values, { isEdit });
    try {
      if (isEdit) {
        const saved = await update.mutateAsync({ id: member._id, changes: payload });
        reset(toFormValues(saved));
        toast.success('Team member saved');
      } else {
        const saved = await create.mutateAsync(payload);
        toast.success('Team member added');
        allowLeave.current = true;
        navigate(`/admin/team/${saved._id}`, { replace: true });
      }
    } catch (error) {
      const { message, details } = getApiError(error);
      const fieldErrors = details.filter((detail) => TEAM_FIELD_ERRORS_FROM_SERVER.includes(detail.field));
      fieldErrors.forEach((detail) => setError(detail.field, { type: 'server', message: detail.message }));
      if (fieldErrors.length > 0) setFocus(fieldErrors[0].field);
      else toast.error(message);
    }
  };

  const confirmDelete = async () => {
    try {
      await remove.mutateAsync(member._id);
      toast.success('Team member deleted');
      allowLeave.current = true;
      navigate('/admin/team', { replace: true });
    } catch (error) {
      setConfirmingDelete(false);
      toast.error(getApiError(error).message);
    }
  };

  return (
    <>
      <Seo title={isEdit ? `Edit ${member.name}` : 'New team member'} noindex />
      <Link to="/admin/team" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to the team
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="break-words text-h2">{isEdit ? member.name : 'New team member'}</h1>
          <p className="mt-1 text-slate-600">{isEdit ? 'Changes appear on the About page as soon as you save.' : 'Nobody sees this person until they are published.'}</p>
        </div>
        {isEdit && <Badge variant={member.isPublished ? 'success' : 'warning'}>{member.isPublished ? 'Published' : 'Draft'}</Badge>}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="min-w-0 space-y-6 lg:col-span-2">
            <Card className="space-y-5">
              <h2 className="text-lg">Profile</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <Input label="Name" required maxLength={100} error={errors.name?.message} {...register('name')} />
                <Input label="Role" required maxLength={100} hint="Their job title." error={errors.role?.message} {...register('role')} />
              </div>
              <Textarea
                label="Bio"
                required
                rows={5}
                maxLength={BIO_MAX}
                hint={`A few sentences about them. ${bioLength}/${BIO_MAX}`}
                error={errors.bio?.message}
                {...register('bio')}
              />
            </Card>

            <Card className="space-y-5">
              <h2 className="text-lg">Links</h2>
              <Input label="LinkedIn" type="url" inputMode="url" spellCheck={false} placeholder="https://www.linkedin.com/in/…" hint="Optional." error={errors.linkedin?.message} {...register('linkedin')} />
              <Input label="GitHub" type="url" inputMode="url" spellCheck={false} placeholder="https://github.com/…" hint="Optional." error={errors.github?.message} {...register('github')} />
            </Card>
          </div>

          <div className="min-w-0 space-y-6">
            <Card>
              <Controller
                control={control}
                name="photo"
                render={({ field }) => (
                  <ImageField label="Photo" shape="round" value={field.value} onChange={field.onChange} error={errors.photo?.message} hint={name ? `Shown next to ${name}.` : ''} />
                )}
              />
            </Card>

            <Card className="space-y-5">
              <h2 className="text-lg">Publishing</h2>
              <Checkbox label="Published" hint="Untick to hide them from the About page." {...register('isPublished')} />
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
            </Card>

            {/* Only administrators may delete (the API enforces it too). Editors never see this card. */}
            {isEdit && user.role === 'admin' && (
              <Card>
                <h2 className="text-lg">Delete</h2>
                <p className="mt-1 text-sm text-slate-600">Removes this person and their photo for good. To only hide them, untick Published instead.</p>
                <Button type="button" variant="danger" className="mt-4" onClick={() => setConfirmingDelete(true)}>
                  Delete team member
                </Button>
              </Card>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button type="submit" loading={isSubmitting} disabled={isEdit && !isDirty}>
            {isEdit ? 'Save changes' : 'Add team member'}
          </Button>
          <Button as={Link} to="/admin/team" variant="ghost">
            {isDirty ? 'Cancel' : 'Back'}
          </Button>
          {isEdit && isDirty && <span className="text-sm text-slate-500">You have unsaved changes.</span>}
        </div>
      </form>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this team member?"
        message={isEdit ? `${member.name} and their photo will be permanently deleted and removed from the website.` : ''}
        loading={remove.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
      <ConfirmDialog
        open={blocker.state === 'blocked'}
        title="Leave without saving?"
        message="Your changes to this team member have not been saved."
        confirmLabel="Leave"
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />
    </>
  );
}

function EditLoader({ id }) {
  const query = useAdminTeamMember(id);
  return (
    <DetailPageState
      query={query}
      loadingLabel="Loading team member"
      errorTitle="We could not load this team member"
      notFound={{ title: 'Team member not found', description: 'They may have been deleted.', backTo: '/admin/team', backLabel: 'Back to the team' }}
    >
      {(member) => <TeamForm key={member._id} member={member} />}
    </DetailPageState>
  );
}

// The page for /new (no id in the address) and for /:id
export default function TeamEdit() {
  const { id } = useParams();
  return id ? <EditLoader id={id} /> : <TeamForm />;
}
