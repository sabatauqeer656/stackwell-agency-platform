import { z } from 'zod';
import { optionalUrl } from './schemaParts.js';

// Mirrors the server's settings rules (server/src/validators/settings.validator.js).
export const TAGLINE_MAX = 200;
export const ADDRESS_MAX = 200;
export const FOOTER_MAX = 300;

export const settingsFormSchema = z.object({
  companyName: z.string().trim().min(2, 'Company name must be at least 2 characters').max(100, 'Company name can be at most 100 characters'),
  tagline: z.string().trim().max(TAGLINE_MAX, `Tagline can be at most ${TAGLINE_MAX} characters`),
  email: z.string().trim().pipe(z.email('Enter a valid email address')),
  phone: z.string().trim().max(30, 'Phone can be at most 30 characters'),
  address: z.string().trim().max(ADDRESS_MAX, `Address can be at most ${ADDRESS_MAX} characters`),
  // Empty is fine: it removes the link from the website
  linkedin: optionalUrl,
  github: optionalUrl,
  twitter: optionalUrl,
  instagram: optionalUrl,
  footerText: z.string().trim().max(FOOTER_MAX, `Footer text can be at most ${FOOTER_MAX} characters`),
});

export const settingsFields = ['companyName', 'tagline', 'email', 'phone', 'address', 'linkedin', 'github', 'twitter', 'instagram', 'footerText'];

// The saved settings -> the values the form starts with (anything missing becomes an empty box)
export const toFormValues = (settings) => Object.fromEntries(settingsFields.map((field) => [field, settings[field] ?? '']));

// Every field is sent. An empty box is sent as '' (the server accepts that for these fields and the website hides what is empty).
export const toPayload = (values) => Object.fromEntries(settingsFields.map((field) => [field, values[field].trim()]));
