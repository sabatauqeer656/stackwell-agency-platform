import { Router } from 'express';
import { getSettings } from '../controllers/settings.controller.js';

// Public: the navbar and footer need the company name, contact details and social links.
// Mounted at /api/v1/settings
const router = Router();
router.get('/', getSettings);

export default router;
