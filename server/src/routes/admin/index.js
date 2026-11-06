import { Router } from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import serviceRoutes from './service.routes.js';
import solutionRoutes from './solution.routes.js';
import projectRoutes from './project.routes.js';
import testimonialRoutes from './testimonial.routes.js';
import teamMemberRoutes from './teamMember.routes.js';
import faqRoutes from './faq.routes.js';
import settingsRoutes from './settings.routes.js';
import inquiryRoutes from './inquiry.routes.js';
import quoteRoutes from './quote.routes.js';
import uploadRoutes from './upload.routes.js';
import { dashboardStats } from '../../controllers/stats.controller.js';

// Everything under /api/v1/admin requires a logged-in admin or editor.
// Guarding the whole router once means a new admin route can never be left open by mistake.
const router = Router();

router.use(protect, authorize('admin', 'editor'));

router.get('/stats', dashboardStats); // the dashboard home: counts and the latest leads

router.use('/services', serviceRoutes);
router.use('/solutions', solutionRoutes);
router.use('/projects', projectRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/team', teamMemberRoutes);
router.use('/faqs', faqRoutes);
router.use('/settings', settingsRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/quotes', quoteRoutes);
router.use('/uploads', uploadRoutes);

export default router;
