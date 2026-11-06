import { useMutation } from '@tanstack/react-query';
import api from '../../lib/axios.js';

const sendQuote = async (data) => {
  const response = await api.post('/quotes', data);
  return response.data.data; // { message: 'Thank you! ...' }
};

export function useSendQuote() {
  return useMutation({ mutationFn: sendQuote });
}
