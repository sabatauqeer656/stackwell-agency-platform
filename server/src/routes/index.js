import { Router } from 'express';
import authRoutes from './auth.routes.js';

// Every feature router is mounted here, under /api/v1
const router = Router();

router.use('/auth', authRoutes);

export default router;
