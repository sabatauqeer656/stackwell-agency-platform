import { z } from 'zod';

// Field rules shared by every public form (contact form, quote wizard).
// They mirror the server's rules (server/src/validators/lead.validator.js), with friendlier messages.
// The browser checks first for instant feedback; the server checks again, because anything
// coming from a browser can be forged.

const PHONE = /^[+\d][\d\s().-]{5,28}$/;

// A text box that was left empty gives "", but the server expects the field to be ABSENT.
// This turns "" into undefined, and undefined is dropped when the data is sent as JSON.
export const emptyToUndefined = (value) => (value === '' ? undefined : value);

export const nameField = z.string().trim().min(2, 'Please enter your name').max(100, 'Please keep your name under 100 characters');

export const emailField = z.string().trim().min(1, 'Please enter your email').pipe(z.email('Enter a valid email address'));

export const phoneField = z
  .string()
  .trim()
  .refine((value) => value === '' || PHONE.test(value), 'Enter a valid phone number, for example +1 555 010 0199')
  .transform(emptyToUndefined);

export const companyField = z.string().trim().max(100, 'Please keep this under 100 characters').transform(emptyToUndefined);

// The honeypot: real visitors never see it, so it stays empty. See HoneypotField.
export const honeypotField = z.string().max(200).transform(emptyToUndefined);
