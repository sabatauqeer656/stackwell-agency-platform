import { z } from 'zod';

// These rules mirror the server's (server/src/validators/lead.validator.js), with friendlier messages.
// The browser checks first so people get instant feedback; the server checks again because
// anything coming from a browser can be forged.

const PHONE = /^[+\d][\d\s().-]{5,28}$/;

// A text box that was left empty gives "", but the server expects the field to be ABSENT.
// This turns "" into undefined, and undefined is dropped when the data is sent as JSON.
const emptyToUndefined = (value) => (value === '' ? undefined : value);

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(100, 'Please keep your name under 100 characters'),
  email: z.string().trim().min(1, 'Please enter your email').pipe(z.email('Enter a valid email address')),
  phone: z
    .string()
    .trim()
    .refine((value) => value === '' || PHONE.test(value), 'Enter a valid phone number, for example +1 555 010 0199')
    .transform(emptyToUndefined),
  company: z.string().trim().max(100, 'Please keep this under 100 characters').transform(emptyToUndefined),
  subject: z.string().trim().min(3, 'Please add a short subject').max(150, 'Please keep the subject under 150 characters'),
  message: z
    .string()
    .trim()
    .min(10, 'Please write at least 10 characters so we can understand your request')
    .max(3000, 'Please keep your message under 3000 characters'),
  // The honeypot: real visitors never see it, so it stays empty. See HoneypotField.
  website: z.string().max(200).transform(emptyToUndefined),
});

export const contactDefaults = { name: '', email: '', phone: '', company: '', subject: '', message: '', website: '' };

// The fields a server error can be attached to
export const contactFields = ['name', 'email', 'phone', 'company', 'subject', 'message'];
