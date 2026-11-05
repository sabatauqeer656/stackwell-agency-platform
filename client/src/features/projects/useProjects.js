import { keepPreviousData, useQuery } from '@tanstack/react-query';
import api from '../../lib/axios.js';

export const PAGE_SIZE = 6;

const fetchProjects = async ({ industry, page }) => {
  const params = { page, limit: PAGE_SIZE };
  if (industry) params.industry = industry; // leave it out entirely for "All"
  const response = await api.get('/projects', { params });
  // items = this page's projects, meta = { page, limit, total, totalPages }
  return { items: response.data.data, meta: response.data.meta };
};

// The filter and page are part of the query key, so every combination is cached on its own:
// going back to a page you already saw is instant.
export function useProjects({ industry = '', page = 1 } = {}) {
  return useQuery({
    queryKey: ['projects', 'list', { industry, page }],
    queryFn: () => fetchProjects({ industry, page }),
    // While the next page loads, keep showing the previous one instead of flashing skeletons
    placeholderData: keepPreviousData,
  });
}
