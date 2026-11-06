import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Seo from '../../components/Seo.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import QueryState from '../../components/ui/QueryState.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import { useAdminSettings, useUpdateSettings } from '../../features/admin/settings.js';
import {
  ADDRESS_MAX,
  FOOTER_MAX,
  TAGLINE_MAX,
  settingsFields,
  settingsFormSchema,
  toFormValues,
  toPayload,
} from '../../features/admin/settingsSchema.js';
import { useUnsavedGuard } from '../../features/admin/useUnsavedGuard.js';
import { useToast } from '../../hooks/useToast.js';
import { getApiError } from '../../lib/apiErrors.js';
import { formatDateTime } from '../../lib/format.js';

function SettingsForm({ settings }) {
  const toast = useToast();
  const update = useUpdateSettings();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setFocus,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: toFormValues(settings),
    mode: 'onTouched',
  });
  const { blocker } = useUnsavedGuard(isDirty);
  const taglineLength = watch('tagline').length;
  const addressLength = watch('address').length;
  const footerLength = watch('footerText').length;

  const onSubmit = async (values) => {
    try {
      const saved = await update.mutateAsync(toPayload(values));
      reset(toFormValues(saved)); // the form now matches what is stored, so it is "clean" again
      toast.success('Settings saved. The website shows them now.');
    } catch (error) {
      const { message, details } = getApiError(error);
      const fieldErrors = details.filter((detail) => settingsFields.includes(detail.field));
      fieldErrors.forEach((detail) => setError(detail.field, { type: 'server', message: detail.message }));
      if (fieldErrors.length > 0) setFocus(fieldErrors[0].field);
      else toast.error(message);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="space-y-5">
            <div>
              <h2 className="text-lg">Company</h2>
              <p className="mt-1 text-sm text-slate-600">Shown in the navbar, the footer and the browser tab.</p>
            </div>
            <Input label="Company name" required maxLength={100} error={errors.companyName?.message} {...register('companyName')} />
            <Textarea
              label="Tagline"
              rows={2}
              maxLength={TAGLINE_MAX}
              hint={`One sentence under the company name. ${taglineLength}/${TAGLINE_MAX}`}
              error={errors.tagline?.message}
              {...register('tagline')}
            />
          </Card>

          <Card className="space-y-5">
            <div>
              <h2 className="text-lg">Contact details</h2>
              <p className="mt-1 text-sm text-slate-600">Shown on the Contact page and in the footer. Leave a box empty to hide it.</p>
            </div>
            <Input label="Email" type="email" required autoComplete="off" error={errors.email?.message} {...register('email')} />
            <Input label="Phone" type="tel" maxLength={30} error={errors.phone?.message} {...register('phone')} />
            <Textarea
              label="Address"
              rows={2}
              maxLength={ADDRESS_MAX}
              hint={`${addressLength}/${ADDRESS_MAX}`}
              error={errors.address?.message}
              {...register('address')}
            />
          </Card>

          <Card className="space-y-5">
            <div>
              <h2 className="text-lg">Social links</h2>
              <p className="mt-1 text-sm text-slate-600">Full web addresses. An empty box removes that link from the website.</p>
            </div>
            <Input label="LinkedIn" type="url" inputMode="url" spellCheck={false} placeholder="https://www.linkedin.com/company/…" error={errors.linkedin?.message} {...register('linkedin')} />
            <Input label="GitHub" type="url" inputMode="url" spellCheck={false} placeholder="https://github.com/…" error={errors.github?.message} {...register('github')} />
            <Input label="Twitter / X" type="url" inputMode="url" spellCheck={false} placeholder="https://x.com/…" error={errors.twitter?.message} {...register('twitter')} />
            <Input label="Instagram" type="url" inputMode="url" spellCheck={false} placeholder="https://www.instagram.com/…" error={errors.instagram?.message} {...register('instagram')} />
          </Card>

          <Card className="space-y-5">
            <div>
              <h2 className="text-lg">Footer</h2>
              <p className="mt-1 text-sm text-slate-600">A short line at the bottom of every page, for example a copyright or registration note.</p>
            </div>
            <Textarea
              label="Footer text"
              rows={3}
              maxLength={FOOTER_MAX}
              hint={`${footerLength}/${FOOTER_MAX}`}
              error={errors.footerText?.message}
              {...register('footerText')}
            />
          </Card>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
            Save settings
          </Button>
          {isDirty ? (
            <>
              <Button type="button" variant="ghost" onClick={() => reset(toFormValues(settings))}>
                Discard changes
              </Button>
              <span className="text-sm text-slate-500">You have unsaved changes.</span>
            </>
          ) : (
            settings.updatedAt && <span className="text-sm text-slate-500">Last saved {formatDateTime(settings.updatedAt)}.</span>
          )}
        </div>
      </form>

      <ConfirmDialog
        open={blocker.state === 'blocked'}
        title="Leave without saving?"
        message="Your changes to the settings have not been saved."
        confirmLabel="Leave"
        // proceed/reset only exist while a navigation is actually blocked, and the dialog can also call onCancel as it closes
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />
    </>
  );
}

function SettingsSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-6 lg:grid-cols-2">
      <p role="status" className="sr-only">
        Loading the settings
      </p>
      {[0, 1, 2, 3].map((key) => (
        <Card key={key} className="space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </Card>
      ))}
    </div>
  );
}

export default function Settings() {
  const query = useAdminSettings();

  return (
    <>
      <Seo title="Settings" noindex />
      <h1 className="text-h2">Settings</h1>
      <p className="mb-8 mt-1 text-slate-600">The company details shown across the whole website. Only administrators can change them.</p>

      <QueryState query={query} skeleton={<SettingsSkeleton />} errorTitle="We could not load the settings">
        {(settings) => <SettingsForm settings={settings} />}
      </QueryState>
    </>
  );
}
