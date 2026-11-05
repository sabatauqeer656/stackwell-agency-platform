import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { honeypot } from '../middleware/honeypot.js';
import { inquiryLimiter } from '../middleware/rateLimiters.js';
import { createInquirySchema } from '../validators/lead.validator.js';
import { createPublic, THANK_YOU } from '../controllers/inquiry.controller.js';

// Public, create-only. Mounted at /api/v1/inquiries
// Order matters: limit the rate first, then validate, then catch bots, then save.
const router = Router();
router.post('/', inquiryLimiter, validate(createInquirySchema), honeypot('website', { message: THANK_YOU }), createPublic);

export default router;
