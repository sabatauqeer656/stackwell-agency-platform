import { z } from 'zod';
import { objectId, slugPattern } from './common.validator.js';

// No .default() here on purpose: the Mongoose model supplies defaults on create.
// If Zod added defaults, a partial update (PATCH) could silently reset fields.
const fields = {
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(slugPattern, 'Slug may only contain lowercase letters, numbers and dashes')
    .max(100),
  summary: z.string().trim().min(10, 'Summary must be at least 10 characters').max(200),
  description: z.string().trim().min(20, 'Description must be at least 20 characters').max(5000),
  icon: z.string().trim().min(1).max(40),
  features: z.array(z.string().trim().min(1).max(120)).max(12),
  order: z.number().int().min(0).max(999),
  isPublished: z.boolean(),
};

// Required on create: title, summary, description. The rest are optional.
export const createServiceSchema = z.object({
  body: z.object({
    title: fields.title,
    summary: fields.summary,
    description: fields.description,
    slug: fields.slug.optional(),
    icon: fields.icon.optional(),
    features: fields.features.optional(),
    order: fields.order.optional(),
    isPublished: fields.isPublished.optional(),
  }),
});

// Update: every field optional, but at least one must be sent
export const updateServiceSchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object(fields)
    .partial()
    .refine((body) => Object.keys(body).length > 0, 'Send at least one field to update'),
});
