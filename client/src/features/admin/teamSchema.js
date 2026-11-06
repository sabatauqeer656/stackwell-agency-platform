import { z } from 'zod';
import { optionalUrl, optionalValue, orderRule } from './schemaParts.js';

// Mirrors the server's team rules (server/src/validators/teamMember.validator.js).
export const BIO_MAX = 500;

export const teamFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name can be at most 100 characters'),
  role: z.string().trim().min(2, 'Role must be at least 2 characters').max(100, 'Role can be at most 100 characters'),
  bio: z.string().trim().min(10, 'Bio must be at least 10 characters').max(BIO_MAX, `Bio can be at most ${BIO_MAX} characters`),
  photo: optionalUrl, // an uploaded image's address
  linkedin: optionalUrl,
  github: optionalUrl,
  order: orderRule,
  isPublished: z.boolean(),
});

export const emptyTeamMember = { name: '', role: '', bio: '', photo: '', linkedin: '', github: '', order: 0, isPublished: true };

export const toFormValues = (member) => ({
  name: member.name,
  role: member.role,
  bio: member.bio,
  photo: member.photo ?? '',
  linkedin: member.linkedin ?? '',
  github: member.github ?? '',
  order: member.order,
  isPublished: member.isPublished,
});

// Form values -> what the API accepts. An empty optional field is left out when creating and sent as null (= remove it) when editing.
export const toPayload = (values, { isEdit }) => ({
  name: values.name,
  role: values.role,
  bio: values.bio,
  photo: optionalValue(values.photo, isEdit),
  linkedin: optionalValue(values.linkedin, isEdit),
  github: optionalValue(values.github, isEdit),
  order: values.order,
  isPublished: values.isPublished,
});

export const TEAM_FIELD_ERRORS_FROM_SERVER = ['name', 'role', 'bio', 'photo', 'linkedin', 'github', 'order'];
