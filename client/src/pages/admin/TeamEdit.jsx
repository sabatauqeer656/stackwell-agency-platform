import { useParams } from 'react-router-dom';
import { Controller } from 'react-hook-form';
import EditorFrame, { DeleteCard } from '../../components/admin/EditorFrame.jsx';
import ImageField from '../../components/admin/ImageField.jsx';
import Card from '../../components/ui/Card.jsx';
import Checkbox from '../../components/ui/Checkbox.jsx';
import DetailPageState from '../../components/ui/DetailPageState.jsx';
import Input from '../../components/ui/Input.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import { useAdminTeamMember, useCreateTeamMember, useDeleteTeamMember, useUpdateTeamMember } from '../../features/admin/team.js';
import { BIO_MAX, TEAM_FIELD_ERRORS_FROM_SERVER, emptyTeamMember, teamFormSchema, toFormValues, toPayload } from '../../features/admin/teamSchema.js';
import { useRecordEditor } from '../../features/admin/useRecordEditor.js';

const config = {
  noun: 'team member',
  Noun: 'Team member',
  plural: 'team members',
  adminPath: '/admin/team',
  backLabel: 'Back to the team',
  createLabel: 'Add team member',
  createdMessage: 'Team member added',
  schema: teamFormSchema,
  empty: emptyTeamMember,
  toFormValues,
  toPayload,
  serverFields: TEAM_FIELD_ERRORS_FROM_SERVER,
  hooks: { useCreate: useCreateTeamMember, useUpdate: useUpdateTeamMember, useDelete: useDeleteTeamMember },
};

// One form for both jobs: adding a team member (no `member`) and editing one.
function TeamForm({ member }) {
  const editor = useRecordEditor({ item: member, config });
  const { form, errors } = editor;
  const { register, control, watch } = form;
  const name = watch('name');
  const bioLength = watch('bio').length;

  return (
    <EditorFrame
      editor={editor}
      config={config}
      title={member?.name}
      published={member?.isPublished}
      intro={editor.isEdit ? 'Changes appear on the About page as soon as you save.' : 'Nobody sees this person until they are published.'}
    >
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

        <DeleteCard editor={editor} config={config} text="Removes this person and their photo for good. To only hide them, untick Published instead." />
      </div>
    </EditorFrame>
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
