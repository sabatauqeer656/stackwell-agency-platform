import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios.js';

const fetchServices = async () => {
  const response = await api.get('/services');
  return response.data.data; // array of published services, already sorted by the API
};

// Returns TanStack Query's result: { data, isPending, isError, refetch, isFetching ... }
export function useServices() {
  return useQuery({ queryKey: ['services'], queryFn: fetchServices });
}
