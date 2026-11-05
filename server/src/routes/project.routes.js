import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { slugParamSchema } from '../validators/common.validator.js';
import { publicListProjectsSchema } from '../validators/project.validator.js';
import { listPublic, getPublic } from '../controllers/project.controller.js';

// Public routes. Mounted at /api/v1/projects
const router = Router();

router.get('/', validate(publicListProjectsSchema), listPublic);
router.get('/:slug', validate(slugParamSchema), getPublic);

export default router;
