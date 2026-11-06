import { z } from 'zod';
import { optionalUrl, optionalValue, orderRule } from './schemaParts.js';

// Mirrors the server's project rules (server/src/validators/project.validator.js).
export const RESULTS_MAX = 8;
export const RESULT_ITEM_MAX = 200;
export const TECH_MAX = 20;
export const TECH_ITEM_MAX = 40;
export const GALLERY_MAX = 10;

const list = (max, itemMax) => z.array(z.object({ value: z.string().trim().max(itemMax, `At most ${itemMax} characters`) })).max(max);

const slugRule = z
  .string()
  .trim()
  .max(100)
  .regex(/^$|^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single dashes, like online-banking-app');

const base = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(100, 'Title can be at most 100 characters'),
  slug: slugRule,
  clientName: z.string().trim().min(2, 'Client name must be at least 2 characters').max(100, 'Client name can be at most 100 characters'),
  solution: z.string().min(1, 'Choose a solution'),
  summary: z.string().trim().min(10, 'Summary must be at least 10 characters').max(200, 'Summary can be at most 200 characters'),
  challenge: z.string().trim().min(20, 'Challenge must be at least 20 characters').max(3000, 'Challenge can be at most 3000 characters'),
  approach: z.string().trim().min(20, 'Approach must be at least 20 characters').max(3000, 'Approach can be at most 3000 characters'),
  results: list(RESULTS_MAX, RESULT_ITEM_MAX),
  techStack: list(TECH_MAX, TECH_ITEM_MAX),
  coverImage: optionalUrl, // an uploaded image's address
  images: z.array(z.string()).max(GALLERY_MAX), // the gallery: uploaded image addresses
  liveUrl: optionalUrl,
  completedAt: z.string(), // yyyy-mm-dd from the date input, or empty
  isFeatured: z.boolean(),
  order: orderRule,
  isPublished: z.boolean(),
});

export const createProjectFormSchema = base;
export const editProjectFormSchema = base.extend({ slug: slugRule.min(1, 'The address cannot be empty') });

export const emptyProject = {
  title: '',
  slug: '',
  clientName: '',
  solution: '',
  summary: '',
  challenge: '',
  approach: '',
  results: [],
  techStack: [],
  coverImage: '',
  images: [],
  liveUrl: '',
  completedAt: '',
  isFeatured: false,
  order: 0,
  isPublished: true,
};

const toEntries = (values = []) => values.map((value) => ({ value }));

// A saved project -> the values the form starts with
export const toFormValues = (project) => ({
  title: project.title,
  slug: project.slug,
  clientName: project.clientName,
  solution: project.solution?._id ?? '', // the API sends the solution as { _id, title, slug }
  summary: project.summary,
  challenge: project.challenge,
  approach: project.approach,
  results: toEntries(project.results),
  techStack: toEntries(project.techStack),
  coverImage: project.coverImage ?? '',
  images: project.images ?? [],
  liveUrl: project.liveUrl ?? '',
  completedAt: project.completedAt ? project.completedAt.slice(0, 10) : '',
  isFeatured: project.isFeatured,
  order: project.order,
  isPublished: project.isPublished,
});

const cleaned = (entries) => entries.map((entry) => entry.value.trim()).filter(Boolean);

// Form values -> what the API accepts.
// Optional fields (cover image, live link, completion date): when creating, an empty one is simply left out.
// When editing, an empty one is sent as null, which tells the server to REMOVE it.
export function toPayload(values, { isEdit }) {
  const payload = {
    title: values.title,
    clientName: values.clientName,
    solution: values.solution,
    summary: values.summary,
    challenge: values.challenge,
    approach: values.approach,
    results: cleaned(values.results),
    techStack: cleaned(values.techStack),
    coverImage: optionalValue(values.coverImage, isEdit),
    images: values.images,
    liveUrl: optionalValue(values.liveUrl, isEdit),
    completedAt: optionalValue(values.completedAt, isEdit),
    isFeatured: values.isFeatured,
    order: values.order,
    isPublished: values.isPublished,
  };
  if (values.slug || isEdit) payload.slug = values.slug;
  return payload;
}

export const PROJECT_FIELD_ERRORS_FROM_SERVER = ['title', 'slug', 'clientName', 'solution', 'summary', 'challenge', 'approach', 'coverImage', 'liveUrl', 'completedAt', 'order'];
