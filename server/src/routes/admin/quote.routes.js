import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { authorize } from '../../middleware/auth.js';
import { idParamSchema } from '../../validators/common.validator.js';
import { attachmentDownloadSchema, listQuotesSchema, updateQuoteSchema } from '../../validators/lead.validator.js';
import { downloadAttachment, listAdmin, getAdmin, update, remove } from '../../controllers/quote.controller.js';

// Mounted at /api/v1/admin/quotes
const router = Router();

router.get('/', validate(listQuotesSchema), listAdmin);
router.get('/:id', validate(idParamSchema), getAdmin);
router.get('/:id/attachments/:index/download', validate(attachmentDownloadSchema), downloadAttachment);
router.patch('/:id', validate(updateQuoteSchema), update);
router.delete('/:id', authorize('admin'), validate(idParamSchema), remove);

export default router;
