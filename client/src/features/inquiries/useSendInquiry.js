import { useMutation } from '@tanstack/react-query';
import api from '../../lib/axios.js';

const sendInquiry = async (data) => {
  const response = await api.post('/inquiries', data);
  return response.data.data; // { message: 'Thank you! ...' }
};

// A "mutation" is TanStack Query's word for a request that CHANGES something on the server
// (a query only reads). It gives us isPending / isSuccess / isError for free.
export function useSendInquiry() {
  return useMutation({ mutationFn: sendInquiry });
}
