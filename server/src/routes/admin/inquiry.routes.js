import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { authorize } from '../../middleware/auth.js';
import { idParamSchema } from '../../validators/common.validator.js';
import { listInquiriesSchema, updateInquirySchema } from '../../validators/lead.validator.js';
import { listAdmin, getAdmin, update, remove } from '../../controllers/inquiry.controller.js';

// Mounted at /api/v1/admin/inquiries. There is no admin "create": inquiries come from visitors.
const router = Router();

router.get('/', validate(listInquiriesSchema), listAdmin);
router.get('/:id', validate(idParamSchema), getAdmin);
router.patch('/:id', validate(updateInquirySchema), update);
router.delete('/:id', authorize('admin'), validate(idParamSchema), remove);

export default router;
