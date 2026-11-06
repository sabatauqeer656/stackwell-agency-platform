import { z } from 'zod';
import { httpUrl } from './common.validator.js';

// An empty string is allowed so an admin can clear a field (e.g. remove the Twitter link)
const optionalUrl = httpUrl.or(z.literal(''));

const fields = {
  companyName: z.string().trim().min(2).max(100),
  tagline: z.string().trim().max(200),
  // Trim BEFORE checking the format: an address pasted with a trailing space is still a valid address
  email: z.string().trim().toLowerCase().pipe(z.email('Enter a valid email')),
  phone: z.string().trim().max(30),
  address: z.string().trim().max(200),
  linkedin: optionalUrl,
  github: optionalUrl,
  twitter: optionalUrl,
  instagram: optionalUrl,
  footerText: z.string().trim().max(300),
};

export const updateSettingsSchema = z.object({
  body: z
    .object(fields)
    .partial()
    .refine((body) => Object.keys(body).length > 0, 'Send at least one field to update'),
});
