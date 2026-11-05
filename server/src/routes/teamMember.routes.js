import { Router } from 'express';
import { listPublic } from '../controllers/teamMember.controller.js';

// Public. Mounted at /api/v1/team
const router = Router();
router.get('/', listPublic);

export default router;
