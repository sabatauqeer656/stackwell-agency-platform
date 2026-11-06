import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios.js';
import { retryUnlessMissing } from '../../lib/apiErrors.js';

export const LEAD_PAGE_SIZE = 10;

// Inquiries and quote requests are managed the same way (list, open, change status/notes, delete),
// so their hooks come from one factory. `resource` is the API path part, e.g. 'inquiries' or 'quotes'.
export function createLeadApi(resource) {
  const keys = {
    list: (params) => ['admin', resource, 'list', params],
    detail: (id) => ['admin', resource, 'detail', id],
  };

  // One page. While the next page loads, the previous one stays on screen (no flicker).
  function useList({ page, status, search }) {
    return useQuery({
      queryKey: keys.list({ page, status, search }),
      queryFn: async () => {
        const params = { page, limit: LEAD_PAGE_SIZE };
        if (status) params.status = status;
        if (search) params.search = search;
        const response = await api.get(`/admin/${resource}`, { params });
        return { items: response.data.data, meta: response.data.meta };
      },
      placeholderData: keepPreviousData,
    });
  }

  function useOne(id) {
    return useQuery({
      queryKey: keys.detail(id),
      queryFn: async () => (await api.get(`/admin/${resource}/${id}`)).data.data,
      retry: retryUnlessMissing,
    });
  }

  // After a change, everything that SHOWS these leads must be refreshed: the lists, and the dashboard numbers.
  function useAfterChange() {
    const queryClient = useQueryClient();
    return () => {
      queryClient.invalidateQueries({ queryKey: ['admin', resource, 'list'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    };
  }

  // The server answers with the updated record, which goes straight into the cache.
  function useUpdate() {
    const queryClient = useQueryClient();
    const refresh = useAfterChange();
    return useMutation({
      mutationFn: async ({ id, changes }) => (await api.patch(`/admin/${resource}/${id}`, changes)).data.data,
      onSuccess: (lead) => {
        queryClient.setQueryData(keys.detail(lead._id), lead);
        refresh();
      },
    });
  }

  function useDelete() {
    const queryClient = useQueryClient();
    const refresh = useAfterChange();
    return useMutation({
      mutationFn: async (id) => api.delete(`/admin/${resource}/${id}`),
      onSuccess: (_result, id) => {
        queryClient.removeQueries({ queryKey: keys.detail(id) });
        refresh();
      },
    });
  }

  return { useList, useOne, useUpdate, useDelete };
}
