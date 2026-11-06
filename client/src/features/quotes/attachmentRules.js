// The attachment rules, as the BROWSER knows them. They match the server's (server/src/middleware/uploads.js)
// so a visitor hears about a problem instantly, before waiting for an upload.
// These checks are only a convenience: the server checks again, and looks inside the files.

export const MAX_FILES = 3;
export const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.docx'];
export const ACCEPT = ALLOWED_EXTENSIONS.join(','); // for <input accept="...">: pre-filters the file picker
export const RULES_TEXT = 'PDF, PNG, JPG or DOCX. Up to 3 files, 5 MB each.';

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const extensionOf = (name) => name.toLowerCase().match(/\.[^.]+$/)?.[0] ?? '';

// Sorts newly chosen files into the ones we can keep and a list of plain-English reasons for the rest.
// The valid files of a batch are kept even when others in the same batch are refused.
export function checkFiles(current, incoming) {
  const accepted = [];
  const problems = [];

  for (const file of incoming) {
    const duplicate = [...current, ...accepted].some((kept) => kept.name === file.name && kept.size === file.size);

    if (!ALLOWED_EXTENSIONS.includes(extensionOf(file.name))) {
      problems.push(`"${file.name}" is not an allowed file type. Only PDF, PNG, JPG and DOCX files can be attached.`);
    } else if (file.size === 0) {
      problems.push(`"${file.name}" is empty.`);
    } else if (file.size > MAX_FILE_BYTES) {
      problems.push(`"${file.name}" is ${formatBytes(file.size)}. Each file must be 5 MB or smaller.`);
    } else if (duplicate) {
      problems.push(`"${file.name}" is already attached.`);
    } else if (current.length + accepted.length >= MAX_FILES) {
      problems.push(`"${file.name}" was not added. You can attach up to ${MAX_FILES} files.`);
    } else {
      accepted.push(file);
    }
  }
  return { accepted, problems };
}

// What the server answers when IT refuses a file (it looks inside the file, so it can catch a disguised one)
export const FILE_ERROR_CODES = ['FILE_TYPE_NOT_ALLOWED', 'FILE_TOO_LARGE', 'TOO_MANY_FILES', 'FILE_EMPTY', 'UPLOAD_ERROR'];
