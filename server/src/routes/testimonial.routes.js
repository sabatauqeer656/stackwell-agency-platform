import { Router } from 'express';
import { listPublic } from '../controllers/testimonial.controller.js';

// Public. Mounted at /api/v1/testimonials
const router = Router();
router.get('/', listPublic);

export default router;
