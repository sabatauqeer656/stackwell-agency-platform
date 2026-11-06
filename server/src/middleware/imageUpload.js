import path from 'node:path';
import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

// Images for the website itself (team photos, project covers and galleries), uploaded by the team from the dashboard.
// Same safety approach as the quote attachments (see uploads.js): the size is limited while the file is being read,
// and what a file REALLY is gets decided by its first bytes, never by its name or the type the browser claims.
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

// Only formats every browser shows safely. SVG is left out on purpose: it can contain scripts.
const IMAGE_TYPES = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' };
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];
const NOT_ALLOWED = 'Only PNG, JPG and WebP images can be uploaded.';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1, fields: 2 },
  fileFilter(req, file, cb) {
    if (!ALLOWED_EXTENSIONS.includes(path.extname(file.originalname).toLowerCase())) {
      return cb(new AppError(NOT_ALLOWED, 415, 'FILE_TYPE_NOT_ALLOWED'));
    }
    cb(null, true);
  },
});

// Reads the multipart request (one file in a field called "image"). multer reports problems in its own
// format, so they are translated into our standard errors.
export const readImage = (req, res, next) => {
  upload.single('image')(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError) {
      switch (error.code) {
        case 'LIMIT_FILE_SIZE':
          return next(new AppError('Images must be 5 MB or smaller.', 413, 'FILE_TOO_LARGE'));
        case 'LIMIT_FILE_COUNT':
        case 'LIMIT_UNEXPECTED_FILE':
          return next(new AppError('Upload one image at a time.', 400, 'TOO_MANY_FILES'));
        default:
          return next(new AppError('The upload could not be read. Please try again.', 400, 'UPLOAD_ERROR'));
      }
    }
    next(error);
  });
};

// The real check: look INSIDE the file. A program renamed to "photo.png" fails here.
export const verifyImage = asyncHandler(async (req, res, next) => {
  if (!req.file) throw new AppError('Choose an image to upload.', 400, 'NO_FILE');
  if (req.file.size === 0) throw new AppError('That file is empty.', 400, 'FILE_EMPTY');

  const detected = await fileTypeFromBuffer(req.file.buffer);
  if (!detected || !(detected.ext in IMAGE_TYPES)) {
    throw new AppError(`That file is not an allowed image. ${NOT_ALLOWED}`, 415, 'FILE_TYPE_NOT_ALLOWED');
  }
  req.file.detected = { ext: detected.ext, mime: IMAGE_TYPES[detected.ext] };
  next();
});
