import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { honeypot } from '../middleware/honeypot.js';
import { quoteLimiter } from '../middleware/rateLimiters.js';
import { createQuoteSchema } from '../validators/lead.validator.js';
import { createPublic, THANK_YOU } from '../controllers/quote.controller.js';

// Public, create-only. Mounted at /api/v1/quotes
const router = Router();
router.post('/', quoteLimiter, validate(createQuoteSchema), honeypot('website', { message: THANK_YOU }), createPublic);

export default router;
