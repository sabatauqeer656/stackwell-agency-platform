import { Plus, X } from 'lucide-react';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';

/**
 * An editable list of short texts (the "features" of a service, for example).
 * Built on React Hook Form's useFieldArray: `fields`, `append` and `remove` come from it, and each row is
 * registered as `${name}.${index}.value`. Pressing Enter in a row adds a new row instead of submitting the form.
 */
export default function StringListField({ label, hint, name, fields, register, errors, append, remove, max, itemMax = 120, placeholder, addLabel }) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-slate-700">{label}</legend>
      {hint && <p className="mt-1 text-sm text-slate-500">{hint}</p>}

      <ul className="mt-3 space-y-2">
        {fields.map((field, index) => (
          <li key={field.id} className="flex items-start gap-2">
            <Input
              className="min-w-0 flex-1"
              aria-label={`${label} ${index + 1}`}
              placeholder={placeholder}
              maxLength={itemMax}
              error={errors?.[index]?.value?.message}
              {...register(`${name}.${index}.value`)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  if (fields.length < max) append({ value: '' }, { shouldFocus: true });
                }
              }}
            />
            <Button type="button" variant="ghost" onClick={() => remove(index)} aria-label={`Remove ${label.toLowerCase()} ${index + 1}`} className="h-11 shrink-0 px-3">
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </li>
        ))}
      </ul>

      <Button type="button" variant="outline" className="mt-3" onClick={() => append({ value: '' }, { shouldFocus: true })} disabled={fields.length >= max}>
        <Plus className="h-4 w-4" aria-hidden="true" />
        {addLabel}
      </Button>
      {fields.length >= max && <p className="mt-2 text-sm text-slate-500">That is the maximum ({max}).</p>}
    </fieldset>
  );
}
