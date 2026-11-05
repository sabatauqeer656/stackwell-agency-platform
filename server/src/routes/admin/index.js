import { Router } from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import serviceRoutes from './service.routes.js';

// Everything under /api/v1/admin requires a logged-in admin or editor.
// Guarding the whole router once means a new admin route can never be left open by mistake.
const router = Router();

router.use(protect, authorize('admin', 'editor'));

router.use('/services', serviceRoutes);

export default router;
