import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios.js';
import { retryUnlessMissing } from '../../lib/apiErrors.js';

const fetchService = async (slug) => {
  const response = await api.get(`/services/${encodeURIComponent(slug)}`);
  return response.data.data;
};

// One service by its URL slug. The key includes the slug, so each service is cached separately.
export function useService(slug) {
  return useQuery({
    queryKey: ['services', slug],
    queryFn: () => fetchService(slug),
    retry: retryUnlessMissing,
  });
}
