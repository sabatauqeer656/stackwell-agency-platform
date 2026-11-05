import { z } from 'zod';
import { objectId, slugPattern } from './common.validator.js';

// No .default() on purpose: the Mongoose model supplies defaults (see service.validator.js).
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
  challenges: z.array(z.string().trim().min(1).max(200)).max(12),
  order: z.number().int().min(0).max(999),
  isPublished: z.boolean(),
};

export const createSolutionSchema = z.object({
  body: z.object({
    title: fields.title,
    summary: fields.summary,
    description: fields.description,
    slug: fields.slug.optional(),
    icon: fields.icon.optional(),
    challenges: fields.challenges.optional(),
    order: fields.order.optional(),
    isPublished: fields.isPublished.optional(),
  }),
});

export const updateSolutionSchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object(fields)
    .partial()
    .refine((body) => Object.keys(body).length > 0, 'Send at least one field to update'),
});
