import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { authorize } from '../../middleware/auth.js';
import { idParamSchema, adminListSchema } from '../../validators/common.validator.js';
import { createTeamMemberSchema, updateTeamMemberSchema } from '../../validators/teamMember.validator.js';
import { listAdmin, getAdmin, create, update, remove } from '../../controllers/teamMember.controller.js';

// Mounted at /api/v1/admin/team (login + role enforced by the parent admin router)
const router = Router();

router.get('/', validate(adminListSchema), listAdmin);
router.get('/:id', validate(idParamSchema), getAdmin);
router.post('/', validate(createTeamMemberSchema), create);
router.patch('/:id', validate(updateTeamMemberSchema), update);
router.delete('/:id', authorize('admin'), validate(idParamSchema), remove);

export default router;
