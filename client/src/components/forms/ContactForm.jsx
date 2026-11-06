import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TriangleAlert } from 'lucide-react';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import Input from '../ui/Input.jsx';
import Textarea from '../ui/Textarea.jsx';
import FormConfirmation from './FormConfirmation.jsx';
import HoneypotField from './HoneypotField.jsx';
import { contactDefaults, contactFields, contactSchema } from '../../features/inquiries/inquirySchema.js';
import { useSendInquiry } from '../../features/inquiries/useSendInquiry.js';
import { getApiError } from '../../lib/apiErrors.js';

export default function ContactForm() {
  const mutation = useSendInquiry();
  const [formError, setFormError] = useState('');
  const confirmationRef = useRef(null);
  const sending = useRef(false); // blocks a second submit (e.g. pressing Enter twice) before React re-renders

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: contactDefaults,
    // onTouched: check a field the first time the visitor leaves it, then re-check on every keystroke.
    // So a red message disappears the moment the value is fixed (not later, when focus moves away,
    // which could shift the layout under the mouse and swallow a click on the button).
    mode: 'onTouched',
  });

  // Move focus to the confirmation so nobody is left wondering whether it worked
  useEffect(() => {
    if (mutation.isSuccess) confirmationRef.current?.focus();
  }, [mutation.isSuccess]);

  const onSubmit = async (data) => {
    if (sending.current) return;
    sending.current = true;
    setFormError('');
    try {
      await mutation.mutateAsync(data);
    } catch (error) {
      const { message, details } = getApiError(error);
      // The server found problems with specific fields: show them next to those fields
      const fieldErrors = details.filter((detail) => contactFields.includes(detail.field));
      fieldErrors.forEach((detail) => setError(detail.field, { type: 'server', message: detail.message }));
      if (fieldErrors.length > 0) setFocus(fieldErrors[0].field);
      else setFormError(message); // rate limit, server down, anything else
    } finally {
      sending.current = false;
    }
  };

  if (mutation.isSuccess) {
    return (
      <FormConfirmation
        title="Message sent"
        resetLabel="Send another message"
        message={mutation.data.message}
        ref={confirmationRef}
        onReset={() => {
          mutation.reset();
          reset();
        }}
      />
    );
  }

  return (
    <Card>
      <h2 className="text-h3">Send us a message</h2>
      <p className="mt-2 text-slate-600">Tell us about your project. We reply within one business day.</p>

      {/* noValidate: turn off the browser's own pop-up bubbles, so our messages are the ones people see */}
      <form onSubmit={(event) => handleSubmit(onSubmit)(event)} noValidate className="relative mt-6 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Name"
            required
            autoComplete="name"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Email"
            type="email"
            required
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            hint="Optional"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Input
            label="Company"
            autoComplete="organization"
            hint="Optional"
            error={errors.company?.message}
            {...register('company')}
          />
        </div>

        <Input label="Subject" required error={errors.subject?.message} {...register('subject')} />
        <Textarea
          label="Message"
          required
          rows={6}
          hint="What are you building, and when would you like to start?"
          error={errors.message?.message}
          {...register('message')}
        />

        <HoneypotField {...register('website')} />

        {formError && (
          <div role="alert" className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <p>{formError}</p>
          </div>
        )}

        <Button type="submit" size="lg" loading={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? 'Sending...' : 'Send message'}
        </Button>
      </form>
    </Card>
  );
}
