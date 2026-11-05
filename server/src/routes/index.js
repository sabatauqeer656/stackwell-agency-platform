import { Router } from 'express';
import authRoutes from './auth.routes.js';
import serviceRoutes from './service.routes.js';
import solutionRoutes from './solution.routes.js';
import projectRoutes from './project.routes.js';
import testimonialRoutes from './testimonial.routes.js';
import teamMemberRoutes from './teamMember.routes.js';
import faqRoutes from './faq.routes.js';
import settingsRoutes from './settings.routes.js';
import inquiryRoutes from './inquiry.routes.js';
import quoteRoutes from './quote.routes.js';
import adminRoutes from './admin/index.js';

// Every feature router is mounted here, under /api/v1
const router = Router();

router.use('/auth', authRoutes);
router.use('/services', serviceRoutes); // public
router.use('/solutions', solutionRoutes); // public
router.use('/projects', projectRoutes); // public
router.use('/testimonials', testimonialRoutes); // public
router.use('/team', teamMemberRoutes); // public
router.use('/faqs', faqRoutes); // public
router.use('/settings', settingsRoutes); // public (read only)
router.use('/inquiries', inquiryRoutes); // public (create only)
router.use('/quotes', quoteRoutes); // public (create only)
router.use('/admin', adminRoutes); // protected

export default router;
