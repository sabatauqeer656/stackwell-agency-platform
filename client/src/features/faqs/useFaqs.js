import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios.js';

const fetchFaqs = async () => {
  const response = await api.get('/faqs');
  return response.data.data; // all published FAQs, already sorted by category and order
};

// There are only a handful of FAQs, so we load them all once and filter in the browser.
// Switching category is then instant, with no extra request.
export function useFaqs() {
  return useQuery({ queryKey: ['faqs'], queryFn: fetchFaqs, staleTime: 10 * 60 * 1000 });
}
