import { useId } from 'react';
import { useParams } from 'react-router-dom';
import EditorFrame, { DeleteCard } from '../../components/admin/EditorFrame.jsx';
import Card from '../../components/ui/Card.jsx';
import Checkbox from '../../components/ui/Checkbox.jsx';
import DetailPageState from '../../components/ui/DetailPageState.jsx';
import Input from '../../components/ui/Input.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import { useAdminFaq, useCreateFaq, useDeleteFaq, useFaqCategories, useUpdateFaq } from '../../features/admin/faqs.js';
import {
  ANSWER_MAX,
  CATEGORY_MAX,
  FAQ_FIELD_ERRORS_FROM_SERVER,
  QUESTION_MAX,
  emptyFaq,
  faqFormSchema,
  toFormValues,
  toPayload,
} from '../../features/admin/faqSchema.js';
import { useRecordEditor } from '../../features/admin/useRecordEditor.js';

const config = {
  noun: 'FAQ',
  Noun: 'FAQ',
  plural: 'FAQs',
  adminPath: '/admin/faqs',
  createLabel: 'Create FAQ',
  schema: faqFormSchema,
  empty: emptyFaq,
  toFormValues,
  toPayload,
  serverFields: FAQ_FIELD_ERRORS_FROM_SERVER,
  hooks: { useCreate: useCreateFaq, useUpdate: useUpdateFaq, useDelete: useDeleteFaq },
};

function FaqForm({ faq }) {
  const editor = useRecordEditor({ item: faq, config });
  const { form, errors } = editor;
  const { register, watch } = form;
  const categories = useFaqCategories();
  const listId = useId();
  const questionLength = watch('question').length;
  const answerLength = watch('answer').length;

  return (
    <EditorFrame
      editor={editor}
      config={config}
      title={faq?.question}
      published={faq?.isPublished}
      intro={editor.isEdit ? 'Changes appear on the FAQ page as soon as you save.' : 'Nothing is public until it is published.'}
    >
      <div className="min-w-0 space-y-6 lg:col-span-2">
        <Card className="space-y-5">
          <h2 className="text-lg">Question and answer</h2>
          <Textarea
            label="Question"
            required
            rows={2}
            maxLength={QUESTION_MAX}
            hint={`Written the way a visitor would ask it. ${questionLength}/${QUESTION_MAX}`}
            error={errors.question?.message}
            {...register('question')}
          />
          <Textarea
            label="Answer"
            required
            rows={8}
            maxLength={ANSWER_MAX}
            hint={`A blank line starts a new paragraph. ${answerLength}/${ANSWER_MAX}`}
            error={errors.answer?.message}
            {...register('answer')}
          />
        </Card>
      </div>

      <div className="min-w-0 space-y-6">
        <Card className="space-y-5">
          <h2 className="text-lg">Publishing</h2>
          <Checkbox label="Published" hint="Untick to keep it as a draft that visitors cannot see." {...register('isPublished')} />
          <Input
            label="Category"
            required
            maxLength={CATEGORY_MAX}
            list={listId}
            autoComplete="off"
            hint="Questions with the same category are grouped together. Pick one or type a new one."
            error={errors.category?.message}
            {...register('category')}
          />
          {/* The suggestions: categories that already exist, so the same one is not typed two different ways */}
          <datalist id={listId}>
            {(categories.data ?? []).map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
          <Input
            label="Order"
            type="number"
            inputMode="numeric"
            min={0}
            max={999}
            hint="Lower numbers come first within a category."
            error={errors.order?.message}
            {...register('order', { valueAsNumber: true })}
          />
        </Card>

        <DeleteCard editor={editor} config={config} text="Removes this question for good. To only hide it, untick Published instead." />
      </div>
    </EditorFrame>
  );
}

function EditLoader({ id }) {
  const query = useAdminFaq(id);
  return (
    <DetailPageState
      query={query}
      loadingLabel="Loading FAQ"
      errorTitle="We could not load this FAQ"
      notFound={{ title: 'FAQ not found', description: 'It may have been deleted.', backTo: '/admin/faqs', backLabel: 'Back to FAQs' }}
    >
      {(faq) => <FaqForm key={faq._id} faq={faq} />}
    </DetailPageState>
  );
}

// The page for /new (no id in the address) and for /:id
export default function FaqEdit() {
  const { id } = useParams();
  return id ? <EditLoader id={id} /> : <FaqForm />;
}
