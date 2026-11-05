import { Router } from 'express';
import authRoutes from './auth.routes.js';
import serviceRoutes from './service.routes.js';
import solutionRoutes from './solution.routes.js';
import projectRoutes from './project.routes.js';
import adminRoutes from './admin/index.js';

// Every feature router is mounted here, under /api/v1
const router = Router();

router.use('/auth', authRoutes);
router.use('/services', serviceRoutes); // public
router.use('/solutions', solutionRoutes); // public
router.use('/projects', projectRoutes); // public
router.use('/admin', adminRoutes); // protected

export default router;
