import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { authorize } from '../../middleware/auth.js';
import { idParamSchema, adminListSchema } from '../../validators/common.validator.js';
import { createProjectSchema, updateProjectSchema } from '../../validators/project.validator.js';
import { listAdmin, getAdmin, create, update, remove } from '../../controllers/project.controller.js';

// Mounted at /api/v1/admin/projects (login + role enforced by the parent admin router)
const router = Router();

router.get('/', validate(adminListSchema), listAdmin);
router.get('/:id', validate(idParamSchema), getAdmin);
router.post('/', validate(createProjectSchema), create);
router.patch('/:id', validate(updateProjectSchema), update);
router.delete('/:id', authorize('admin'), validate(idParamSchema), remove);

export default router;
