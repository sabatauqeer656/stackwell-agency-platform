import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios.js';
import { retryUnlessMissing } from '../../lib/apiErrors.js';

export const CONTENT_PAGE_SIZE = 10;

// Services, solutions, projects, team, testimonials and FAQs are all managed the same way:
// a list, one record to open, create, update and delete. Their hooks come from this one factory.
//   resource    - the API path part, e.g. 'services' (-> /admin/services)
//   publicKeys  - the cache keys of the PUBLIC site's data for this content. After a change they are marked stale,
//                 so the public pages show the edit at once instead of the old copy.
export function createContentApi(resource, { publicKeys = [] } = {}) {
  const keys = {
    list: (params) => ['admin', resource, 'list', params],
    detail: (id) => ['admin', resource, 'detail', id],
  };

  // One page. `published` is true, false or undefined (all).
  function useList({ page, published, search }) {
    return useQuery({
      queryKey: keys.list({ page, published, search }),
      queryFn: async () => {
        const params = { page, limit: CONTENT_PAGE_SIZE };
        if (published !== undefined) params.published = published;
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

  // After a change, everything that SHOWS this content is refreshed: the admin lists, the dashboard numbers,
  // and the public site's copy.
  function useAfterChange() {
    const queryClient = useQueryClient();
    return () => {
      queryClient.invalidateQueries({ queryKey: ['admin', resource, 'list'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      for (const key of publicKeys) queryClient.invalidateQueries({ queryKey: key });
    };
  }

  function useCreate() {
    const queryClient = useQueryClient();
    const refresh = useAfterChange();
    return useMutation({
      mutationFn: async (data) => (await api.post(`/admin/${resource}`, data)).data.data,
      onSuccess: (item) => {
        queryClient.setQueryData(keys.detail(item._id), item);
        refresh();
      },
    });
  }

  // The server answers with the saved record, which goes straight into the cache.
  function useUpdate() {
    const queryClient = useQueryClient();
    const refresh = useAfterChange();
    return useMutation({
      mutationFn: async ({ id, changes }) => (await api.patch(`/admin/${resource}/${id}`, changes)).data.data,
      onSuccess: (item) => {
        queryClient.setQueryData(keys.detail(item._id), item);
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

  return { useList, useOne, useCreate, useUpdate, useDelete };
}
