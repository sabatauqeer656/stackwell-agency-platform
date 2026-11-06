import { z } from 'zod';

// Services and Solutions share one editor: a title, summary, description, icon, a list of short points
// ("features" for a service, "challenges" for a solution), an order and a published switch.
// These rules mirror the server's validators. The server always re-checks; checking here too means the editor
// sees a problem next to the field instead of after a round trip.
export const LIST_MAX = 12;

const slugRule = z
  .string()
  .trim()
  .max(100)
  .regex(/^$|^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single dashes, like custom-web-apps');

const ORDER_MESSAGE = 'Enter a whole number from 0 to 999';

// `itemMax`: how long one point in the list may be (the server allows 120 for features, 200 for challenges)
export function createIconContentSchemas(itemMax) {
  const base = z.object({
    title: z.string().trim().min(2, 'Title must be at least 2 characters').max(100, 'Title can be at most 100 characters'),
    slug: slugRule,
    summary: z.string().trim().min(10, 'Summary must be at least 10 characters').max(200, 'Summary can be at most 200 characters'),
    description: z.string().trim().min(20, 'Description must be at least 20 characters').max(5000, 'Description can be at most 5000 characters'),
    icon: z.string().min(1, 'Choose an icon'),
    // useFieldArray needs objects, so each point is { value: 'text' }. Empty rows are dropped when saving.
    list: z.array(z.object({ value: z.string().trim().max(itemMax, `At most ${itemMax} characters`) })).max(LIST_MAX),
    order: z.number({ error: ORDER_MESSAGE }).int(ORDER_MESSAGE).min(0, ORDER_MESSAGE).max(999, ORDER_MESSAGE),
    isPublished: z.boolean(),
  });
  return {
    // When creating, an empty slug is fine (the server makes one from the title). When editing, the slug is required.
    create: base,
    edit: base.extend({ slug: slugRule.min(1, 'The address cannot be empty') }),
  };
}

export const emptyIconContent = (icon) => ({ title: '', slug: '', summary: '', description: '', icon, list: [], order: 0, isPublished: true });

// A saved record -> the values the form starts with. `listKey` is 'features' or 'challenges'.
export const toFormValues = (item, listKey) => ({
  title: item.title,
  slug: item.slug,
  summary: item.summary,
  description: item.description,
  icon: item.icon,
  list: (item[listKey] ?? []).map((value) => ({ value })),
  order: item.order,
  isPublished: item.isPublished,
});

// Form values -> what the API accepts
export function toPayload(values, listKey, { includeEmptySlug }) {
  const payload = {
    title: values.title,
    summary: values.summary,
    description: values.description,
    icon: values.icon,
    [listKey]: values.list.map((entry) => entry.value.trim()).filter(Boolean),
    order: values.order,
    isPublished: values.isPublished,
  };
  if (values.slug || includeEmptySlug) payload.slug = values.slug;
  return payload;
}

// Server complaints about these fields are shown next to the field. (Anything else becomes a toast.)
export const FIELD_ERRORS_FROM_SERVER = ['title', 'slug', 'summary', 'description', 'icon', 'order'];
