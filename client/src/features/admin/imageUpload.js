import { useMutation } from '@tanstack/react-query';
import api from '../../lib/axios.js';

// The rules for website images. They match the server (server/src/middleware/imageUpload.js), which is the one
// that really decides. Checking here too just saves a pointless upload and gives an instant, clear message.
export const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp';
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const IMAGE_RULES_TEXT = 'PNG, JPG or WebP, up to 5 MB.';

// Returns a plain-English problem, or '' when the file looks fine.
export function checkImageFile(file) {
  if (!IMAGE_ACCEPT.split(',').includes(file.type)) return `"${file.name}" is not allowed. Only PNG, JPG and WebP images can be uploaded.`;
  if (file.size > IMAGE_MAX_BYTES) return `"${file.name}" is too large. Images must be 5 MB or smaller.`;
  return '';
}

// Sends ONE image. The answer is { url, width, height }: the url is what gets saved in the team member / project.
export function useUploadImage() {
  return useMutation({
    mutationFn: async (file) => {
      const form = new FormData();
      form.append('image', file);
      // A bigger timeout than the rest of the app: a 5 MB photo on a slow connection takes a while.
      return (await api.post('/admin/uploads/images', form, { timeout: 60_000 })).data.data;
    },
  });
}
