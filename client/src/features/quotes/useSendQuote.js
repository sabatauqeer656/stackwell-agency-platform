import { useMutation } from '@tanstack/react-query';
import api from '../../lib/axios.js';

// Without files the quote travels as plain JSON, as before.
// With files, JSON cannot carry them, so the request becomes "multipart/form-data": the answers go in
// ONE field called "data" (as JSON text) and each file in a field called "attachments".
const sendQuote = async ({ data, files = [] }) => {
  if (files.length === 0) {
    const response = await api.post('/quotes', data);
    return response.data.data; // { message: 'Thank you! ...' }
  }

  const form = new FormData();
  form.append('data', JSON.stringify(data));
  for (const file of files) form.append('attachments', file, file.name);

  // The browser fills in the multipart Content-Type (with its boundary) by itself.
  // Uploads can be slow, so allow longer than the normal 15 seconds.
  const response = await api.post('/quotes', form, { timeout: 90_000 });
  return response.data.data;
};

// Call as mutation.mutateAsync({ data, files })
export function useSendQuote() {
  return useMutation({ mutationFn: sendQuote });
}
