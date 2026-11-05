import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { loginSchema } from '../validators/auth.validator.js';
import { login } from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', validate(loginSchema), login);

export default router;
