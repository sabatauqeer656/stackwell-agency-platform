import { Router } from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { readImage, verifyImage } from '../../middleware/imageUpload.js';
import { uploadSiteImage } from '../../services/storage.service.js';

// Mounted at /api/v1/admin/uploads (login + role enforced by the parent admin router).
// The dashboard uploads an image here first, gets its address back, and then saves that address
// in the team member / project it belongs to.
const router = Router();

router.post(
  '/images',
  readImage,
  verifyImage,
  asyncHandler(async (req, res) => {
    sendSuccess(res, await uploadSiteImage(req.file), { status: 201 });
  })
);

export default router;
