import { useParams } from 'react-router-dom';
import { Controller } from 'react-hook-form';
import EditorFrame, { DeleteCard } from '../../components/admin/EditorFrame.jsx';
import ImageField from '../../components/admin/ImageField.jsx';
import Card from '../../components/ui/Card.jsx';
import Checkbox from '../../components/ui/Checkbox.jsx';
import DetailPageState from '../../components/ui/DetailPageState.jsx';
import Input from '../../components/ui/Input.jsx';
import QueryState from '../../components/ui/QueryState.jsx';
import Select from '../../components/ui/Select.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import StarRating from '../../components/ui/StarRating.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import { useProjectChoices } from '../../features/admin/projects.js';
import { useAdminTestimonial, useCreateTestimonial, useDeleteTestimonial, useUpdateTestimonial } from '../../features/admin/testimonials.js';
import {
  QUOTE_MAX,
  RATING_LABELS,
  TESTIMONIAL_FIELD_ERRORS_FROM_SERVER,
  emptyTestimonial,
  testimonialFormSchema,
  toFormValues,
  toPayload,
} from '../../features/admin/testimonialSchema.js';
import { useRecordEditor } from '../../features/admin/useRecordEditor.js';

const config = {
  noun: 'testimonial',
  Noun: 'Testimonial',
  plural: 'testimonials',
  adminPath: '/admin/testimonials',
  schema: testimonialFormSchema,
  empty: emptyTestimonial,
  toFormValues,
  toPayload,
  serverFields: TESTIMONIAL_FIELD_ERRORS_FROM_SERVER,
  hooks: { useCreate: useCreateTestimonial, useUpdate: useUpdateTestimonial, useDelete: useDeleteTestimonial },
};

// `projects` is the list for the dropdown. It is loaded BEFORE the form appears, so the saved choice is selected from the start.
function TestimonialForm({ testimonial, projects }) {
  const editor = useRecordEditor({ item: testimonial, config });
  const { form, errors } = editor;
  const { register, control, watch } = form;
  const quoteLength = watch('quote').length;
  const rating = Number(watch('rating'));
  const name = watch('clientName');

  return (
    <EditorFrame
      editor={editor}
      config={config}
      title={testimonial ? `${testimonial.clientName}'s testimonial` : undefined}
      published={testimonial?.isPublished}
      intro={editor.isEdit ? 'Changes appear on the website as soon as you save.' : 'Nothing is public until it is published.'}
    >
      <div className="min-w-0 space-y-6 lg:col-span-2">
        <Card className="space-y-5">
          <h2 className="text-lg">The quote</h2>
          <Textarea
            label="Quote"
            required
            rows={6}
            maxLength={QUOTE_MAX}
            hint={`What the client said, without quotation marks. ${quoteLength}/${QUOTE_MAX}`}
            error={errors.quote?.message}
            {...register('quote')}
          />
          <div className="flex flex-wrap items-end gap-4">
            <Select label="Rating" required className="min-w-0 flex-1" error={errors.rating?.message} {...register('rating', { valueAsNumber: true })}>
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {RATING_LABELS[value]}
                </option>
              ))}
            </Select>
            <div className="flex h-11 items-center">{rating >= 1 && rating <= 5 && <StarRating rating={rating} />}</div>
          </div>
        </Card>

        <Card className="space-y-5">
          <h2 className="text-lg">Who said it</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Client name" required maxLength={100} error={errors.clientName?.message} {...register('clientName')} />
            <Input label="Client role" required maxLength={100} hint="For example: CTO." error={errors.clientRole?.message} {...register('clientRole')} />
          </div>
          <Input label="Company" maxLength={100} hint="Optional." error={errors.company?.message} {...register('company')} />
          <Select label="About project" hint="Optional. The project this client is talking about." error={errors.project?.message} {...register('project')}>
            <option value="">No project</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.title}
                {project.isPublished ? '' : ' (draft)'}
              </option>
            ))}
          </Select>
        </Card>
      </div>

      <div className="min-w-0 space-y-6">
        <Card>
          <Controller
            control={control}
            name="avatar"
            render={({ field }) => (
              <ImageField label="Photo" shape="round" value={field.value} onChange={field.onChange} error={errors.avatar?.message} hint={name ? `Shown next to ${name}.` : ''} />
            )}
          />
        </Card>

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
        </Card>

        <DeleteCard editor={editor} config={config} text="Removes this testimonial and its photo for good. To only hide it, untick Published instead." />
      </div>
    </EditorFrame>
  );
}

function EditLoader({ id, projects }) {
  const query = useAdminTestimonial(id);
  return (
    <DetailPageState
      query={query}
      loadingLabel="Loading testimonial"
      errorTitle="We could not load this testimonial"
      notFound={{ title: 'Testimonial not found', description: 'It may have been deleted.', backTo: '/admin/testimonials', backLabel: 'Back to testimonials' }}
    >
      {(testimonial) => <TestimonialForm key={testimonial._id} testimonial={testimonial} projects={projects} />}
    </DetailPageState>
  );
}

function FormSkeleton() {
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
export default function TestimonialEdit() {
  const { id } = useParams();
  const choices = useProjectChoices();

  // The link to a project is optional, so an EMPTY list must still show the form. QueryState treats an empty array as
  // "nothing here", so the list is wrapped in an object to get past that.
  const query = { ...choices, data: choices.data ? { projects: choices.data } : undefined };
  return (
    <QueryState query={query} skeleton={<FormSkeleton />} errorTitle="We could not load the projects">
      {({ projects }) => (id ? <EditLoader id={id} projects={projects} /> : <TestimonialForm projects={projects} />)}
    </QueryState>
  );
}
