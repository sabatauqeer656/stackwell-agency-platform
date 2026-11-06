import Input from '../../ui/Input.jsx';
import Textarea from '../../ui/Textarea.jsx';
import HoneypotField from '../HoneypotField.jsx';

// Step 3: the description and how to reach the visitor.
export default function DetailsStep({ register, errors }) {
  return (
    <div className="space-y-5">
      <Textarea
        label="Tell us about your project"
        required
        rows={6}
        hint="What problem are you solving, who is it for, and anything we should know?"
        error={errors.description?.message}
        {...register('description')}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Name" required autoComplete="name" error={errors.name?.message} {...register('name')} />
        <Input label="Email" type="email" required autoComplete="email" error={errors.email?.message} {...register('email')} />
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
      <HoneypotField {...register('website')} />
    </div>
  );
}
