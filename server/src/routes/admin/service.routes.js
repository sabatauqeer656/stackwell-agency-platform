import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { authorize } from '../../middleware/auth.js';
import { idParamSchema } from '../../validators/common.validator.js';
import {
  createServiceSchema,
  updateServiceSchema,
  adminListServicesSchema,
} from '../../validators/service.validator.js';
import { listAdmin, getAdmin, create, update, remove } from '../../controllers/service.controller.js';

// Mounted at /api/v1/admin/services. Login + role (admin or editor) is already
// enforced by the parent admin router, so only the extra rules appear here.
const router = Router();

router.get('/', validate(adminListServicesSchema), listAdmin);
router.get('/:id', validate(idParamSchema), getAdmin);
router.post('/', validate(createServiceSchema), create);
router.patch('/:id', validate(updateServiceSchema), update);
router.delete('/:id', authorize('admin'), validate(idParamSchema), remove); // editors cannot delete

export default router;
