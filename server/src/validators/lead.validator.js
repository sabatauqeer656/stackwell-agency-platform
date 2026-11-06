import { z } from 'zod';
import { paginationQuery } from '../utils/pagination.js';
import { objectId } from './common.validator.js';
import {
  INQUIRY_STATUSES,
  QUOTE_STATUSES,
  PROJECT_TYPES,
  BUDGET_RANGES,
  TIMELINES,
} from '../constants/leads.js';

// ---- Fields shared by both public forms ----
const contactFields = {
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  // Trim BEFORE checking the format: an address pasted with a trailing space is still a valid address
  email: z.string().trim().toLowerCase().max(254).pipe(z.email('Enter a valid email')),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s().-]{5,28}$/, 'Enter a valid phone number'),
  company: z.string().trim().max(100),
  // Honeypot: hidden from people, filled by bots. Handled by the honeypot middleware.
  website: z.string().max(200),
};

// ---- Public: contact form (POST /inquiries) ----
// Only these fields are accepted. Anything else (like "status") is stripped by Zod.
export const createInquirySchema = z.object({
  body: z.object({
    name: contactFields.name,
    email: contactFields.email,
    subject: z.string().trim().min(3, 'Subject must be at least 3 characters').max(150),
    message: z.string().trim().min(10, 'Message must be at least 10 characters').max(3000),
    phone: contactFields.phone.optional(),
    company: contactFields.company.optional(),
    website: contactFields.website.optional(),
  }),
});

// ---- Public: quote wizard (POST /quotes) ----
export const createQuoteSchema = z.object({
  body: z.object({
    name: contactFields.name,
    email: contactFields.email,
    projectType: z.enum(PROJECT_TYPES, 'Choose a project type'),
    budgetRange: z.enum(BUDGET_RANGES, 'Choose a budget range'),
    timeline: z.enum(TIMELINES, 'Choose a timeline'),
    description: z.string().trim().min(20, 'Please describe your project in at least 20 characters').max(5000),
    services: z.array(objectId).max(6).optional(),
    phone: contactFields.phone.optional(),
    company: contactFields.company.optional(),
    website: contactFields.website.optional(),
  }),
});

// ---- Admin ----
const adminListQuery = paginationQuery.extend({
  search: z.string().trim().max(100).optional(),
});

export const listInquiriesSchema = z.object({
  query: adminListQuery.extend({ status: z.enum(INQUIRY_STATUSES).optional() }),
});

export const listQuotesSchema = z.object({
  query: adminListQuery.extend({ status: z.enum(QUOTE_STATUSES).optional() }),
});

const notes = z.string().trim().max(2000); // '' clears the note

export const updateInquirySchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object({ status: z.enum(INQUIRY_STATUSES), notes })
    .partial()
    .refine((body) => Object.keys(body).length > 0, 'Send at least one field to update'),
});

export const updateQuoteSchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object({ status: z.enum(QUOTE_STATUSES), notes })
    .partial()
    .refine((body) => Object.keys(body).length > 0, 'Send at least one field to update'),
});

// GET /admin/quotes/:id/attachments/:index/download  (the quote has at most 3 attachments: 0, 1 or 2)
export const attachmentDownloadSchema = z.object({
  params: z.object({
    id: objectId,
    index: z.coerce.number().int().min(0).max(2),
  }),
});
