import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { authorize } from '../../middleware/auth.js';
import { updateSettingsSchema } from '../../validators/settings.validator.js';
import { updateSettings } from '../../controllers/settings.controller.js';

// Mounted at /api/v1/admin/settings. Only admins may change site-wide settings.
const router = Router();
router.patch('/', authorize('admin'), validate(updateSettingsSchema), updateSettings);

export default router;
