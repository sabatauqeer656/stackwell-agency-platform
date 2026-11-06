import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios.js';
import { retryUnlessMissing } from '../../lib/apiErrors.js';

export const INQUIRY_PAGE_SIZE = 10;
export const INQUIRY_STATUSES = ['new', 'read', 'replied', 'archived'];

const keys = {
  all: ['admin', 'inquiries'],
  list: (params) => ['admin', 'inquiries', 'list', params],
  detail: (id) => ['admin', 'inquiries', 'detail', id],
};

// One page of inquiries. While the next page loads, the previous one stays on screen (no flicker).
export function useInquiries({ page, status, search }) {
  return useQuery({
    queryKey: keys.list({ page, status, search }),
    queryFn: async () => {
      const params = { page, limit: INQUIRY_PAGE_SIZE };
      if (status) params.status = status;
      if (search) params.search = search;
      const response = await api.get('/admin/inquiries', { params });
      return { items: response.data.data, meta: response.data.meta };
    },
    placeholderData: keepPreviousData,
  });
}

export function useInquiry(id) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: async () => (await api.get(`/admin/inquiries/${id}`)).data.data,
    retry: retryUnlessMissing,
  });
}

// After a change, anything that SHOWS inquiries must be refreshed: the lists, and the dashboard numbers.
function useAfterChange() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'inquiries', 'list'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
  };
}

// Change the status and/or the notes. The server answers with the updated inquiry, which we put straight into the cache.
export function useUpdateInquiry() {
  const queryClient = useQueryClient();
  const refresh = useAfterChange();
  return useMutation({
    mutationFn: async ({ id, changes }) => (await api.patch(`/admin/inquiries/${id}`, changes)).data.data,
    onSuccess: (inquiry) => {
      queryClient.setQueryData(keys.detail(inquiry._id), inquiry);
      refresh();
    },
  });
}

export function useDeleteInquiry() {
  const queryClient = useQueryClient();
  const refresh = useAfterChange();
  return useMutation({
    mutationFn: async (id) => api.delete(`/admin/inquiries/${id}`),
    onSuccess: (_result, id) => {
      queryClient.removeQueries({ queryKey: keys.detail(id) });
      refresh();
    },
  });
}
