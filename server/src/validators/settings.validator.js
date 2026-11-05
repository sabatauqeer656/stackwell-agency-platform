import { z } from 'zod';
import { httpUrl } from './common.validator.js';

// An empty string is allowed so an admin can clear a field (e.g. remove the Twitter link)
const optionalUrl = httpUrl.or(z.literal(''));

const fields = {
  companyName: z.string().trim().min(2).max(100),
  tagline: z.string().trim().max(200),
  email: z.email('Enter a valid email').trim().toLowerCase(),
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
