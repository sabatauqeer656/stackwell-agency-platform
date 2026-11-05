import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimiters.js';
import { loginSchema } from '../validators/auth.validator.js';
import { login, refresh, logout, me } from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, me);

export default router;
