import { z } from 'zod';
import { objectId, httpUrl } from './common.validator.js';

const fields = {
  name: z.string().trim().min(2).max(100),
  role: z.string().trim().min(2).max(100),
  bio: z.string().trim().min(10, 'Bio must be at least 10 characters').max(500),
  photo: httpUrl,
  linkedin: httpUrl,
  github: httpUrl,
  order: z.number().int().min(0).max(999),
  isPublished: z.boolean(),
};

export const createTeamMemberSchema = z.object({
  body: z.object({
    name: fields.name,
    role: fields.role,
    bio: fields.bio,
    photo: fields.photo.optional(),
    linkedin: fields.linkedin.optional(),
    github: fields.github.optional(),
    order: fields.order.optional(),
    isPublished: fields.isPublished.optional(),
  }),
});

// On update, the optional fields may also be sent as null, which means "remove it".
const clearable = { photo: fields.photo.nullable(), linkedin: fields.linkedin.nullable(), github: fields.github.nullable() };

export const updateTeamMemberSchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object({ ...fields, ...clearable })
    .partial()
    .refine((body) => Object.keys(body).length > 0, 'Send at least one field to update'),
});
