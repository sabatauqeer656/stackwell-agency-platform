import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios.js';
import { retryUnlessMissing } from '../../lib/apiErrors.js';

const fetchProject = async (slug) => {
  const response = await api.get(`/projects/${encodeURIComponent(slug)}`);
  return response.data.data;
};

// One case study. The 'detail' part of the key stops a project whose slug happens to be
// "featured" or "list" from sharing a cache entry with those lists.
export function useProject(slug) {
  return useQuery({
    queryKey: ['projects', 'detail', slug],
    queryFn: () => fetchProject(slug),
    retry: retryUnlessMissing,
  });
}
