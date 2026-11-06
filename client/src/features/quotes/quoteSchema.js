import { z } from 'zod';
import { companyField, emailField, honeypotField, nameField, phoneField } from '../forms/fields.js';
import { budgetRanges, projectTypes, timelines } from './quoteOptions.js';

const values = (options) => options.map((option) => option.value);

// One schema for the WHOLE wizard. Each step then validates only its own fields (see `steps`),
// so a visitor is never told off about a field they have not reached yet.
export const quoteSchema = z.object({
  projectType: z.enum(values(projectTypes), 'Please choose the type of project'),
  // Services are kept as slugs while the visitor fills the form, and turned into ids when sending.
  // A single checked box can arrive as a plain string, so normalise it into a list first.
  services: z.preprocess(
    (value) => (Array.isArray(value) ? value : value ? [value] : []),
    z.array(z.string().max(100)).max(6, 'Please choose up to 6 services')
  ),
  budgetRange: z.enum(values(budgetRanges), 'Please choose a budget range'),
  timeline: z.enum(values(timelines), 'Please choose a timeline'),
  description: z
    .string()
    .trim()
    .min(20, 'Please describe your project in at least 20 characters')
    .max(5000, 'Please keep the description under 5000 characters'),
  name: nameField,
  email: emailField,
  phone: phoneField,
  company: companyField,
  website: honeypotField,
});

// The wizard's steps, and which form fields each one owns
export const steps = [
  { id: 'project', title: 'Your project', fields: ['projectType', 'services'] },
  { id: 'budget', title: 'Budget and timeline', fields: ['budgetRange', 'timeline'] },
  { id: 'details', title: 'Your details', fields: ['description', 'name', 'email', 'phone', 'company'] },
  { id: 'review', title: 'Review and send', fields: [] },
];

export const quoteDefaults = {
  projectType: '',
  services: [],
  budgetRange: '',
  timeline: '',
  description: '',
  name: '',
  email: '',
  phone: '',
  company: '',
  website: '',
};

// Which step a field belongs to (used to jump to the right step when the server reports a problem)
export const stepOfField = (field) => steps.findIndex((step) => step.fields.includes(field));
