import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { slugParamSchema } from '../validators/common.validator.js';
import { listPublic, getPublic } from '../controllers/service.controller.js';

// Public routes: no login needed. Mounted at /api/v1/services
const router = Router();

router.get('/', listPublic);
router.get('/:slug', validate(slugParamSchema), getPublic);

export default router;
