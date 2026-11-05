import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios.js';

// True when the API says "no such service" (404) or "that is not even a valid slug" (400).
export const isMissing = (error) => [400, 404].includes(error?.response?.status);

const fetchService = async (slug) => {
  const response = await api.get(`/services/${encodeURIComponent(slug)}`);
  return response.data.data;
};

// One service by its URL slug. The key includes the slug, so each service is cached separately.
export function useService(slug) {
  return useQuery({
    queryKey: ['services', slug],
    queryFn: () => fetchService(slug),
    // 4xx answers (404 "does not exist", 400 "malformed slug") will not change if we ask again.
    // Only unexpected failures (network, 5xx) are worth one retry.
    retry: (failureCount, error) => !isMissing(error) && failureCount < 1,
  });
}
