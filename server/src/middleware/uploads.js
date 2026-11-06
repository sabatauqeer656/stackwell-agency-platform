import path from 'node:path';
import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

// ---- The rules for attachments, in one place ----
export const MAX_FILES = 3;
export const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB each

// What a file really IS is decided by its first bytes (its "magic number"), never by its name or by the
// type the browser claims: both can be faked in a second. SVG, HTML, scripts and archives are not on the list.
const ALLOWED_TYPES = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};
const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.docx'];
const NOT_ALLOWED = 'Only PDF, PNG, JPG and DOCX files can be attached.';

// "..\\..\\evil<script>.pdf" -> "evil_script_.pdf". Used only to display a name, never as a path.
const safeFileName = (name) =>
  path.basename(String(name).replaceAll('\\', '/')).replace(/[\u0000-\u001f<>:"/\\|?*]+/g, '_').slice(0, 100) || 'file';

// Files are kept in memory (not on disk) while the request is processed, then sent on to Cloudinary.
// The size and count limits below are what stop a visitor from filling the server's memory.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES, files: MAX_FILES, fields: 5, fieldSize: 100 * 1024 },
  // First, cheap check on the NAME. The real check on the content comes later (verifyAttachments).
  fileFilter(req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return cb(new AppError(`"${safeFileName(file.originalname)}" is not allowed. ${NOT_ALLOWED}`, 415, 'FILE_TYPE_NOT_ALLOWED'));
    }
    cb(null, true);
  },
});

// Reads the multipart request. Requests without files (plain JSON) pass straight through untouched.
// multer reports problems in its own format, so they are translated into our standard errors.
export const uploadAttachments = (req, res, next) => {
  upload.array('attachments', MAX_FILES)(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError) {
      switch (error.code) {
        case 'LIMIT_FILE_SIZE':
          return next(new AppError(`Each file must be 5 MB or smaller.`, 413, 'FILE_TOO_LARGE'));
        case 'LIMIT_FILE_COUNT':
        case 'LIMIT_UNEXPECTED_FILE':
          return next(new AppError(`You can attach up to ${MAX_FILES} files.`, 400, 'TOO_MANY_FILES'));
        default:
          return next(new AppError('The upload could not be read. Please try again.', 400, 'UPLOAD_ERROR'));
      }
    }
    next(error); // already one of ours (like the file type error above), or an unexpected one
  });
};

// With files, the form fields cannot travel as JSON, so the browser sends them as ONE field called
// "data" that holds the JSON text. Turn it back into req.body so the normal validation can run on it.
export const parseMultipartData = (req, res, next) => {
  if (!req.is('multipart/form-data')) return next();
  try {
    req.body = JSON.parse(req.body.data ?? '{}');
  } catch {
    return next(new AppError('The form data could not be read.', 400, 'INVALID_FORM_DATA'));
  }
  next();
};

// The real check: look INSIDE each file. A program renamed to "brief.pdf" fails here.
// Runs after validation and after the honeypot, so rejected requests and bots cost almost nothing.
export const verifyAttachments = asyncHandler(async (req, res, next) => {
  for (const file of req.files ?? []) {
    file.safeName = safeFileName(file.originalname);
    if (file.size === 0) {
      throw new AppError(`"${file.safeName}" is empty.`, 400, 'FILE_EMPTY');
    }
    const detected = await fileTypeFromBuffer(file.buffer);
    if (!detected || !(detected.ext in ALLOWED_TYPES)) {
      throw new AppError(`"${file.safeName}" is not an allowed file. ${NOT_ALLOWED}`, 415, 'FILE_TYPE_NOT_ALLOWED');
    }
    file.detected = { ext: detected.ext, mime: ALLOWED_TYPES[detected.ext] };
  }
  next();
});
