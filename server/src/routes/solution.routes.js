import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { slugParamSchema } from '../validators/common.validator.js';
import { listPublic, getPublic } from '../controllers/solution.controller.js';

// Public routes. Mounted at /api/v1/solutions
const router = Router();

router.get('/', listPublic);
router.get('/:slug', validate(slugParamSchema), getPublic);

export default router;
