import { Router } from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import serviceRoutes from './service.routes.js';
import solutionRoutes from './solution.routes.js';
import projectRoutes from './project.routes.js';

// Everything under /api/v1/admin requires a logged-in admin or editor.
// Guarding the whole router once means a new admin route can never be left open by mistake.
const router = Router();

router.use(protect, authorize('admin', 'editor'));

router.use('/services', serviceRoutes);
router.use('/solutions', solutionRoutes);
router.use('/projects', projectRoutes);

export default router;
