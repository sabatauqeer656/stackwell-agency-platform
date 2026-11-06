import { z } from 'zod';
import { iconNames } from '../../components/ui/DynamicIcon.jsx';

// These rules mirror the server's (server/src/validators/service.validator.js). The server always re-checks,
// but checking here too means the editor sees a problem next to the field instead of after a round trip.
export const SERVICE_FEATURES_MAX = 12;

const slugRule = z
  .string()
  .trim()
  .max(100)
  .regex(/^$|^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single dashes, like custom-web-apps');

const base = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(100, 'Title can be at most 100 characters'),
  slug: slugRule,
  summary: z.string().trim().min(10, 'Summary must be at least 10 characters').max(200, 'Summary can be at most 200 characters'),
  description: z.string().trim().min(20, 'Description must be at least 20 characters').max(5000, 'Description can be at most 5000 characters'),
  icon: z.string().min(1, 'Choose an icon'),
  // useFieldArray needs objects, so each feature is { value: 'text' }. Empty rows are dropped when saving.
  features: z.array(z.object({ value: z.string().trim().max(120, 'At most 120 characters') })).max(SERVICE_FEATURES_MAX),
  order: z.number({ error: 'Enter a whole number from 0 to 999' }).int('Enter a whole number from 0 to 999').min(0, 'Enter a whole number from 0 to 999').max(999, 'Enter a whole number from 0 to 999'),
  isPublished: z.boolean(),
});

// When creating, an empty slug is fine (the server makes one from the title). When editing, the slug is required.
export const createServiceFormSchema = base;
export const editServiceFormSchema = base.extend({ slug: slugRule.min(1, 'The address cannot be empty') });

export const serviceFormFields = ['title', 'slug', 'summary', 'description', 'icon', 'features', 'order', 'isPublished'];

export const emptyService = { title: '', slug: '', summary: '', description: '', icon: 'Code', features: [], order: 0, isPublished: true };

// A saved service -> the values the form starts with
export const toFormValues = (service) => ({
  title: service.title,
  slug: service.slug,
  summary: service.summary,
  description: service.description,
  icon: service.icon,
  features: service.features.map((value) => ({ value })),
  order: service.order,
  isPublished: service.isPublished,
});

// Form values -> what the API accepts
export function toPayload(values, { includeEmptySlug }) {
  const payload = {
    title: values.title,
    summary: values.summary,
    description: values.description,
    icon: values.icon,
    features: values.features.map((feature) => feature.value.trim()).filter(Boolean),
    order: values.order,
    isPublished: values.isPublished,
  };
  if (values.slug || includeEmptySlug) payload.slug = values.slug;
  return payload;
}

export { iconNames };
