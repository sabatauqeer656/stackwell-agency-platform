import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios.js';

const fetchTestimonials = async () => {
  const response = await api.get('/testimonials');
  return response.data.data;
};

export function useTestimonials() {
  return useQuery({ queryKey: ['testimonials'], queryFn: fetchTestimonials });
}
