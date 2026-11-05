import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios.js';

const fetchFeaturedProjects = async () => {
  // Axios turns params into ?featured=true&limit=3. The API fills in each project's industry.
  const response = await api.get('/projects', { params: { featured: true, limit: 3 } });
  return response.data.data; // the list itself; response.data.meta holds the pagination info
};

export function useFeaturedProjects() {
  return useQuery({ queryKey: ['projects', 'featured'], queryFn: fetchFeaturedProjects });
}
