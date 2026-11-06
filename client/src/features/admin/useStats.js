import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios.js';

const fetchStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data.data; // { leads, content, recent }
};

// The numbers on the dashboard home. Unlike the public site, this data changes while the page is open
// (a new lead can arrive any minute), so it is kept fresh for 30 seconds only and refetched when you
// come back to the browser tab.
export function useStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: fetchStats,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}
