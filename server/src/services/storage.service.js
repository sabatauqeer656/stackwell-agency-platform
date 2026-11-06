import { randomUUID } from 'node:crypto';
import cloudinary from '../config/cloudinary.js';
import AppError from '../utils/AppError.js';

// Quote attachments are private client documents. They are uploaded as type "authenticated":
// there is NO public link to them. The only way to open one is a signed link that the server
// creates for a logged-in team member, and that link expires after five minutes.
const FOLDER = 'stackwell/quote-attachments';
const DOWNLOAD_LINK_SECONDS = 5 * 60;

function uploadOne(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: FOLDER,
        public_id: randomUUID(), // a random name, so the original file name never appears in a link
        resource_type: 'auto', // images and PDFs are stored as images, everything else as raw files
        type: 'authenticated',
        overwrite: false,
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(file.buffer);
  });
}

// Removes files from Cloudinary. Best effort: a failure here is logged, never thrown, because it
// is a cleanup step and must not hide the real error that triggered it.
export async function deleteAttachments(attachments = []) {
  const results = await Promise.allSettled(
    attachments.map((attachment) =>
      cloudinary.uploader.destroy(attachment.publicId, {
        resource_type: attachment.resourceType,
        type: 'authenticated',
        invalidate: true,
      })
    )
  );
  for (const result of results) {
    if (result.status === 'rejected') console.error('Could not delete an uploaded file:', result.reason?.message ?? result.reason);
  }
}

// Uploads every file (in parallel). Returns what we keep in the database: the file's address
// at Cloudinary plus its details. If ANY upload fails, the ones that did succeed are removed again,
// so a half-sent quote never leaves orphan files behind.
export async function uploadAttachments(files = []) {
  const results = await Promise.allSettled(files.map(uploadOne));

  const stored = results.map((result, index) =>
    result.status === 'fulfilled'
      ? {
          publicId: result.value.public_id,
          resourceType: result.value.resource_type,
          format: result.value.format ?? '',
          originalName: files[index].safeName,
          mimeType: files[index].detected.mime,
          size: files[index].size,
        }
      : null
  );

  const failed = results.find((result) => result.status === 'rejected');
  if (failed) {
    console.error('File upload failed:', failed.reason?.message ?? failed.reason);
    await deleteAttachments(stored.filter(Boolean));
    throw new AppError('We could not store your file. Please try again.', 502, 'UPLOAD_FAILED');
  }
  return stored;
}

// A short-lived, signed link to one attachment. Only create it for someone who is logged in.
export function getDownloadUrl(attachment) {
  return cloudinary.utils.private_download_url(attachment.publicId, attachment.format ?? '', {
    resource_type: attachment.resourceType,
    type: 'authenticated',
    attachment: true,
    expires_at: Math.floor(Date.now() / 1000) + DOWNLOAD_LINK_SECONDS,
  });
}

export const DOWNLOAD_LINK_LIFETIME_SECONDS = DOWNLOAD_LINK_SECONDS;
