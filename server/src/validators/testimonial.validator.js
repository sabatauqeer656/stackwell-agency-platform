import { z } from 'zod';
import { objectId, httpUrl } from './common.validator.js';

// No .default() on purpose: the Mongoose model supplies defaults.
const fields = {
  clientName: z.string().trim().min(2).max(100),
  clientRole: z.string().trim().min(2).max(100),
  company: z.string().trim().max(100),
  quote: z.string().trim().min(10, 'Quote must be at least 10 characters').max(600),
  rating: z.number().int('Rating must be a whole number').min(1).max(5),
  avatar: httpUrl,
  project: objectId.nullable(), // null on update = unlink the project
  order: z.number().int().min(0).max(999),
  isPublished: z.boolean(),
};

export const createTestimonialSchema = z.object({
  body: z.object({
    clientName: fields.clientName,
    clientRole: fields.clientRole,
    quote: fields.quote,
    company: fields.company.optional(),
    rating: fields.rating.optional(),
    avatar: fields.avatar.optional(),
    project: objectId.optional(),
    order: fields.order.optional(),
    isPublished: fields.isPublished.optional(),
  }),
});

// On update, the optional fields may also be sent as null, which means "remove it" (project: unlink it).
const clearable = { company: fields.company.nullable(), avatar: fields.avatar.nullable() };

export const updateTestimonialSchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object({ ...fields, ...clearable })
    .partial()
    .refine((body) => Object.keys(body).length > 0, 'Send at least one field to update'),
});
