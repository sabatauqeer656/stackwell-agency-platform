import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios.js';
import { retryUnlessMissing } from '../../lib/apiErrors.js';

const fetchSolution = async (slug) => {
  const response = await api.get(`/solutions/${encodeURIComponent(slug)}`);
  return response.data.data;
};

// One industry by its URL slug (e.g. "fintech").
export function useSolution(slug) {
  return useQuery({
    queryKey: ['solutions', slug],
    queryFn: () => fetchSolution(slug),
    retry: retryUnlessMissing,
  });
}
