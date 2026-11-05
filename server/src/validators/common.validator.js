import { z } from 'zod';

// A MongoDB ObjectId is 24 hex characters. Checking it here stops junk like /services/abc
// from ever reaching the database.
export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const idParamSchema = z.object({
  params: z.object({ id: objectId }),
});

export const slugParamSchema = z.object({
  params: z.object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug').max(100),
  }),
});
