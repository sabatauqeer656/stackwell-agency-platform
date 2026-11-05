import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios.js';

// Shown while the API is loading, or if it cannot be reached, so the layout never breaks.
export const DEFAULT_SETTINGS = {
  companyName: 'Stackwell',
  tagline: 'We build software that moves your business forward.',
  email: '',
  phone: '',
  address: '',
  linkedin: '',
  github: '',
  twitter: '',
  instagram: '',
  footerText: '',
};

const fetchSettings = async () => {
  const response = await api.get('/settings');
  return response.data.data; // the API wraps everything as { success, data }
};

// Company name, contact details and social links, edited by admins in the dashboard.
// TanStack Query caches the result, so Navbar and Footer share ONE request.
export function useSettings() {
  const { data } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    staleTime: 10 * 60 * 1000, // these rarely change: reuse for 10 minutes
  });

  // Real values win; anything missing falls back to the defaults
  return { ...DEFAULT_SETTINGS, ...data };
}
