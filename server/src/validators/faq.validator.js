import { z } from 'zod';
import { objectId } from './common.validator.js';

const fields = {
  question: z.string().trim().min(5, 'Question must be at least 5 characters').max(200),
  answer: z.string().trim().min(10, 'Answer must be at least 10 characters').max(2000),
  category: z.string().trim().min(1).max(50),
  order: z.number().int().min(0).max(999),
  isPublished: z.boolean(),
};

export const createFaqSchema = z.object({
  body: z.object({
    question: fields.question,
    answer: fields.answer,
    category: fields.category.optional(),
    order: fields.order.optional(),
    isPublished: fields.isPublished.optional(),
  }),
});

export const updateFaqSchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object(fields)
    .partial()
    .refine((body) => Object.keys(body).length > 0, 'Send at least one field to update'),
});

// Public list: /faqs?category=Pricing
export const publicListFaqsSchema = z.object({
  query: z.object({ category: z.string().trim().min(1).max(50).optional() }),
});
