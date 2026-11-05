import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios.js';

const fetchTeam = async () => {
  const response = await api.get('/team');
  return response.data.data; // published team members, already sorted by the API
};

export function useTeam() {
  return useQuery({ queryKey: ['team'], queryFn: fetchTeam, staleTime: 10 * 60 * 1000 });
}
