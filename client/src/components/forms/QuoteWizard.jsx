import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TriangleAlert } from 'lucide-react';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import FormConfirmation from './FormConfirmation.jsx';
import StepIndicator from './StepIndicator.jsx';
import BudgetStep from './quote/BudgetStep.jsx';
import DetailsStep from './quote/DetailsStep.jsx';
import ProjectStep from './quote/ProjectStep.jsx';
import ReviewStep from './quote/ReviewStep.jsx';
import { useServices } from '../../features/services/useServices.js';
import { FILE_ERROR_CODES, checkFiles } from '../../features/quotes/attachmentRules.js';
import { clearDraft, loadDraft, saveDraft } from '../../features/quotes/quoteDraft.js';
import { isSlug, projectTypeForService } from '../../features/quotes/quoteOptions.js';
import { quoteDefaults, quoteSchema, stepOfField, steps } from '../../features/quotes/quoteSchema.js';
import { useSendQuote } from '../../features/quotes/useSendQuote.js';
import { getApiError } from '../../lib/apiErrors.js';

// Short sentences under each step's title
const intros = [
  'Choose the closest match. You can add details later.',
  'Rough answers are fine. We use them to suggest the right approach.',
  'The more we know, the better our quote will be.',
  'Check everything below. Use Edit to change an answer.',
];

// Starting values, from (in order): empty defaults, then a saved draft, then the address bar.
// /quote?service=mobile-app-development pre-ticks that service and pre-selects the matching project type.
function buildStart(searchParams) {
  const draft = loadDraft();
  const values = { ...quoteDefaults, ...draft?.values };
  const service = searchParams.get('service');

  if (isSlug(service)) {
    if (!values.services.includes(service)) values.services = [...values.services, service].slice(0, 6);
    if (!values.projectType && projectTypeForService[service]) values.projectType = projectTypeForService[service];
    return { values, step: 0, fileCount: 0 }; // someone who came from a service page starts at the beginning
  }
  return { values, step: draft?.step ?? 0, fileCount: draft?.fileCount ?? 0 };
}

export default function QuoteWizard() {
  const [searchParams] = useSearchParams();
  const [start] = useState(() => buildStart(searchParams)); // computed once, when the page opens
  const [step, setStep] = useState(start.step);
  const [formError, setFormError] = useState('');

  // The attached files. They live here, in plain React state, and NOT in the form library or in the saved
  // draft: a File is a handle to something on the visitor's disk, so it cannot be stored as text.
  const [files, setFiles] = useState([]);
  const [fileProblems, setFileProblems] = useState([]); // reasons why some files were refused

  const servicesQuery = useServices(); // usually already cached from the Services pages
  const mutation = useSendQuote();

  const headingRef = useRef(null);
  const confirmationRef = useRef(null);
  const dropzoneRef = useRef(null); // the file input, so focus can be sent there
  const pendingDropzoneFocus = useRef(false); // set when the SERVER refused a file
  const pendingFocus = useRef(null); // a field to focus once its step is on screen (after a server error)
  const previousStep = useRef(start.step);
  const sending = useRef(false); // blocks a second submit before React re-renders

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    reset,
    setError,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(quoteSchema),
    defaultValues: start.values,
    mode: 'onTouched', // check a field when first left, then on every change
  });

  const isLast = step === steps.length - 1;

  // Runs after every change to any field (change events bubble up from the inputs to the <form>):
  //  1. If that field is showing an error (for example one raised by "Next"), check it again straight
  //     away, so the message disappears as soon as the visitor fixes it. Otherwise it would linger
  //     until the field loses focus, and that late layout shift can swallow a click on "Next".
  //  2. Remember the draft, so an accidental refresh does not lose it.
  const onFieldChange = (event) => {
    const { name } = event.target;
    if (name && errors[name]) trigger(name);
    saveDraft(getValues(), step, files.length);
  };
  // The draft is also saved whenever the step or the number of files changes
  useEffect(() => {
    saveDraft(getValues(), step, files.length);
  }, [getValues, step, files.length]);

  const addFiles = (incoming) => {
    const { accepted, problems } = checkFiles(files, incoming);
    setFiles([...files, ...accepted]);
    setFileProblems(problems); // replaces the previous message: it always describes the LAST attempt
  };
  const removeFile = (index) => {
    setFiles(files.filter((_, position) => position !== index));
    setFileProblems([]);
  };

  // When the step changes, move keyboard focus to it (so Tab continues from the new step).
  // Comparing with the PREVIOUS step (instead of a "first run" flag) also keeps focus alone on page load,
  // even in development where React deliberately runs effects twice.
  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    if (pendingDropzoneFocus.current) {
      dropzoneRef.current?.focus();
      pendingDropzoneFocus.current = false;
    } else if (pendingFocus.current) {
      setFocus(pendingFocus.current);
      pendingFocus.current = null;
    } else {
      headingRef.current?.focus();
    }
  }, [step, setFocus]);

  useEffect(() => {
    if (mutation.isSuccess) confirmationRef.current?.focus();
  }, [mutation.isSuccess]);

  // "Next" checks ONLY the fields of the current step
  const goNext = async () => {
    // shouldFocus: if something is wrong, move keyboard focus to the first problem
    const valid = await trigger(steps[step].fields, { shouldFocus: true });
    if (valid) setStep(step + 1);
  };

  const onSubmit = async (data) => {
    if (sending.current) return;
    sending.current = true;
    setFormError('');
    try {
      // The form keeps service slugs; the server wants ids
      const idBySlug = Object.fromEntries((servicesQuery.data ?? []).map((service) => [service.slug, service._id]));
      const payload = { ...data, services: data.services.map((slug) => idBySlug[slug]).filter(Boolean) };
      if (payload.services.length === 0) delete payload.services;

      await mutation.mutateAsync({ data: payload, files });
      clearDraft();
    } catch (error) {
      const { code, message, details } = getApiError(error);
      const fieldErrors = details.filter((detail) => stepOfField(detail.field) >= 0);
      if (FILE_ERROR_CODES.includes(code)) {
        // The server refused a file (it looks INSIDE files, so it can catch a disguised one the browser let through).
        // Go back to the step where files are attached and say which one.
        setFileProblems([message]);
        pendingDropzoneFocus.current = true;
        setStep(stepOfField('description'));
      } else if (fieldErrors.length > 0) {
        // The server disliked something: show the message next to the field and go back to its step
        fieldErrors.forEach((detail) => setError(detail.field, { type: 'server', message: detail.message }));
        pendingFocus.current = fieldErrors[0].field;
        setStep(stepOfField(fieldErrors[0].field));
      } else {
        setFormError(message); // rate limit, server down, anything else
      }
    } finally {
      sending.current = false;
    }
  };

  // One handler for every step: "Next" on steps 1-3 (also when pressing Enter), "Send" on the last
  const onFormSubmit = (event) => {
    event.preventDefault();
    if (isLast) handleSubmit(onSubmit)(event);
    else goNext();
  };

  const startOver = () => {
    mutation.reset();
    reset(quoteDefaults);
    clearDraft();
    setFiles([]);
    setFileProblems([]);
    setFormError('');
    setStep(0);
  };

  if (mutation.isSuccess) {
    return (
      <FormConfirmation
        title="Request received"
        resetLabel="Send another request"
        message={mutation.data.message}
        ref={confirmationRef}
        onReset={startOver}
      />
    );
  }

  return (
    <Card>
      <StepIndicator steps={steps} current={step} />

      {/* onChange on the <form> catches the change events that bubble up from every input inside it */}
      <form onSubmit={onFormSubmit} onChange={onFieldChange} noValidate className="relative mt-8">
        <h2 ref={headingRef} tabIndex={-1} className="text-h3 focus:outline-none">
          {steps[step].title}
        </h2>
        <p className="mb-6 mt-1 text-slate-600">{intros[step]}</p>

        {step === 0 && <ProjectStep register={register} errors={errors} servicesQuery={servicesQuery} />}
        {step === 1 && <BudgetStep register={register} errors={errors} />}
        {step === 2 && (
          <DetailsStep
            register={register}
            errors={errors}
            files={files}
            fileProblems={fileProblems}
            lostFiles={start.fileCount > 0 && files.length === 0}
            onAddFiles={addFiles}
            onRemoveFile={removeFile}
            dropzoneRef={dropzoneRef}
          />
        )}
        {step === 3 && <ReviewStep values={getValues()} files={files} servicesQuery={servicesQuery} onEdit={setStep} />}

        {formError && (
          <div role="alert" className="mt-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <p>{formError}</p>
          </div>
        )}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          {step > 0 ? (
            <Button variant="outline" size="lg" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : (
            <span />
          )}
          <Button type="submit" size="lg" loading={isSubmitting}>
            {isLast ? (isSubmitting ? 'Sending...' : 'Send request') : 'Next'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
