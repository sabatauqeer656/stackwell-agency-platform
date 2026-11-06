import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { honeypot } from '../middleware/honeypot.js';
import { quoteLimiter } from '../middleware/rateLimiters.js';
import { parseMultipartData, uploadAttachments, verifyAttachments } from '../middleware/uploads.js';
import { createQuoteSchema } from '../validators/lead.validator.js';
import { createPublic, THANK_YOU } from '../controllers/quote.controller.js';

// Public, create-only. Mounted at /api/v1/quotes
// Accepts plain JSON, or multipart/form-data when the visitor attaches files.
// The order is deliberate, cheapest check first:
//   rate limit -> read the upload (size/count/name limits) -> read the form data -> validate it
//   -> catch bots -> look inside the files -> store everything
const router = Router();
router.post(
  '/',
  quoteLimiter,
  uploadAttachments,
  parseMultipartData,
  validate(createQuoteSchema),
  honeypot('website', { message: THANK_YOU }),
  verifyAttachments,
  createPublic
);

export default router;
