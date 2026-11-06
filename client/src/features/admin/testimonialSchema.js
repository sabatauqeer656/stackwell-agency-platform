import { z } from 'zod';
import { optionalUrl, optionalValue, orderRule } from './schemaParts.js';

// Mirrors the server's testimonial rules (server/src/validators/testimonial.validator.js).
export const QUOTE_MAX = 600;

export const testimonialFormSchema = z.object({
  clientName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name can be at most 100 characters'),
  clientRole: z.string().trim().min(2, 'Role must be at least 2 characters').max(100, 'Role can be at most 100 characters'),
  company: z.string().trim().max(100, 'Company can be at most 100 characters'),
  quote: z.string().trim().min(10, 'Quote must be at least 10 characters').max(QUOTE_MAX, `Quote can be at most ${QUOTE_MAX} characters`),
  rating: z.number({ error: 'Choose a rating from 1 to 5' }).int().min(1, 'Choose a rating from 1 to 5').max(5, 'Choose a rating from 1 to 5'),
  avatar: optionalUrl, // an uploaded image's address
  project: z.string(), // a project's id, or '' for none
  order: orderRule,
  isPublished: z.boolean(),
});

export const emptyTestimonial = { clientName: '', clientRole: '', company: '', quote: '', rating: 5, avatar: '', project: '', order: 0, isPublished: true };

export const RATING_LABELS = { 5: '5 stars (excellent)', 4: '4 stars', 3: '3 stars', 2: '2 stars', 1: '1 star' };

export const toFormValues = (testimonial) => ({
  clientName: testimonial.clientName,
  clientRole: testimonial.clientRole,
  company: testimonial.company ?? '',
  quote: testimonial.quote,
  rating: testimonial.rating ?? 5,
  avatar: testimonial.avatar ?? '',
  project: testimonial.project?._id ?? '', // the API sends the project as { _id, title, slug }
  order: testimonial.order,
  isPublished: testimonial.isPublished,
});

// Form values -> what the API accepts. An empty optional field is left out when creating and sent as null (= remove it,
// or unlink the project) when editing.
export const toPayload = (values, { isEdit }) => ({
  clientName: values.clientName,
  clientRole: values.clientRole,
  company: optionalValue(values.company, isEdit),
  quote: values.quote,
  rating: values.rating,
  avatar: optionalValue(values.avatar, isEdit),
  project: optionalValue(values.project, isEdit),
  order: values.order,
  isPublished: values.isPublished,
});

export const TESTIMONIAL_FIELD_ERRORS_FROM_SERVER = ['clientName', 'clientRole', 'company', 'quote', 'rating', 'avatar', 'project', 'order'];
