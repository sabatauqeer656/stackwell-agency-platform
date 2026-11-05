import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { authorize } from '../../middleware/auth.js';
import { idParamSchema, adminListSchema } from '../../validators/common.validator.js';
import { createFaqSchema, updateFaqSchema } from '../../validators/faq.validator.js';
import { listAdmin, getAdmin, create, update, remove } from '../../controllers/faq.controller.js';

// Mounted at /api/v1/admin/faqs (login + role enforced by the parent admin router)
const router = Router();

router.get('/', validate(adminListSchema), listAdmin);
router.get('/:id', validate(idParamSchema), getAdmin);
router.post('/', validate(createFaqSchema), create);
router.patch('/:id', validate(updateFaqSchema), update);
router.delete('/:id', authorize('admin'), validate(idParamSchema), remove);

export default router;
