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

// The raw query: use it when a page needs to know about loading and error states
// (for example the Contact page, whose whole purpose is to show these details).
// TanStack Query caches the result, so every component shares ONE request.
export function useSettingsQuery() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    staleTime: 10 * 60 * 1000, // these rarely change: reuse for 10 minutes
  });
}

// Company name, contact details and social links, edited by admins in the dashboard.
// Always returns a complete object: real values win, anything missing falls back to the defaults.
export function useSettings() {
  const { data } = useSettingsQuery();
  return { ...DEFAULT_SETTINGS, ...data };
}
