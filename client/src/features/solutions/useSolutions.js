import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios.js';

const fetchSolutions = async () => {
  const response = await api.get('/solutions');
  return response.data.data; // the industries, used for the filter chips on /projects
};

export function useSolutions() {
  return useQuery({ queryKey: ['solutions'], queryFn: fetchSolutions, staleTime: 10 * 60 * 1000 });
}
