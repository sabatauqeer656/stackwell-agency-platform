import { z } from 'zod';
import { paginationQuery } from '../utils/pagination.js';
import { objectId, slugPattern } from './common.validator.js';

const httpUrl = z.url({ protocol: /^https?$/, message: 'Must be a valid http(s) URL' }).max(500);
const stringList = (max, itemMax) => z.array(z.string().trim().min(1).max(itemMax)).max(max);

// No .default() on purpose: the Mongoose model supplies defaults.
const fields = {
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(100),
  slug: z.string().trim().toLowerCase().regex(slugPattern, 'Slug may only contain lowercase letters, numbers and dashes').max(100),
  clientName: z.string().trim().min(2).max(100),
  solution: objectId,
  summary: z.string().trim().min(10, 'Summary must be at least 10 characters').max(200),
  challenge: z.string().trim().min(20, 'Challenge must be at least 20 characters').max(3000),
  approach: z.string().trim().min(20, 'Approach must be at least 20 characters').max(3000),
  results: stringList(8, 200),
  techStack: stringList(20, 40),
  coverImage: httpUrl,
  images: z.array(httpUrl).max(10),
  liveUrl: httpUrl,
  completedAt: z.coerce.date(),
  isFeatured: z.boolean(),
  order: z.number().int().min(0).max(999),
  isPublished: z.boolean(),
};

export const createProjectSchema = z.object({
  body: z.object({
    title: fields.title,
    clientName: fields.clientName,
    solution: fields.solution,
    summary: fields.summary,
    challenge: fields.challenge,
    approach: fields.approach,
    slug: fields.slug.optional(),
    results: fields.results.optional(),
    techStack: fields.techStack.optional(),
    coverImage: fields.coverImage.optional(),
    images: fields.images.optional(),
    liveUrl: fields.liveUrl.optional(),
    completedAt: fields.completedAt.optional(),
    isFeatured: fields.isFeatured.optional(),
    order: fields.order.optional(),
    isPublished: fields.isPublished.optional(),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object(fields)
    .partial()
    .refine((body) => Object.keys(body).length > 0, 'Send at least one field to update'),
});

// Public list: /projects?industry=fintech&featured=true&page=1&limit=9
export const publicListProjectsSchema = z.object({
  query: paginationQuery.extend({
    industry: z.string().trim().toLowerCase().regex(slugPattern, 'Invalid industry').max(100).optional(),
    featured: z.enum(['true']).transform(() => true).optional(),
  }),
});
