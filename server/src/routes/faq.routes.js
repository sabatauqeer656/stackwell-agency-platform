import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { publicListFaqsSchema } from '../validators/faq.validator.js';
import { listPublic } from '../controllers/faq.controller.js';

// Public. Mounted at /api/v1/faqs   (optional ?category=Pricing)
const router = Router();
router.get('/', validate(publicListFaqsSchema), listPublic);

export default router;
