import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios.js';

// The editor reads the same public endpoint the website uses (the settings are public by nature: the footer shows them),
// but under its OWN cache key and with no caching delay, so the form always starts from what is really stored.
export function useAdminSettings() {
  return useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => (await api.get('/settings')).data.data,
  });
}

// Saves the changes (administrators only: the API refuses everyone else).
// The saved settings are put straight into the website's own cache, so the navbar, footer and Contact page show
// the new details at once, without a reload.
export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (changes) => (await api.patch('/admin/settings', changes)).data.data,
    onSuccess: (settings) => {
      queryClient.setQueryData(['admin', 'settings'], settings);
      queryClient.setQueryData(['settings'], settings);
    },
  });
}
