import { z } from 'zod';
import { companyField, emailField, honeypotField, nameField, phoneField } from '../forms/fields.js';

export const contactSchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  company: companyField,
  subject: z.string().trim().min(3, 'Please add a short subject').max(150, 'Please keep the subject under 150 characters'),
  message: z
    .string()
    .trim()
    .min(10, 'Please write at least 10 characters so we can understand your request')
    .max(3000, 'Please keep your message under 3000 characters'),
  website: honeypotField,
});

export const contactDefaults = { name: '', email: '', phone: '', company: '', subject: '', message: '', website: '' };

// The fields a server error can be attached to
export const contactFields = ['name', 'email', 'phone', 'company', 'subject', 'message'];
