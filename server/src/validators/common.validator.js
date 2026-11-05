import { z } from 'zod';
import { paginationQuery } from '../utils/pagination.js';

// A MongoDB ObjectId is 24 hex characters. Checking it here stops junk like /services/abc
// from ever reaching the database.
export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const idParamSchema = z.object({
  params: z.object({ id: objectId }),
});

export const slugParamSchema = z.object({
  params: z.object({
    slug: z.string().regex(slugPattern, 'Invalid slug').max(100),
  }),
});

// Query string for every admin list: ?page=1&limit=10&search=web&published=false
export const adminListSchema = z.object({
  query: paginationQuery.extend({
    search: z.string().trim().max(100).optional(),
    published: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .optional(),
  }),
});
