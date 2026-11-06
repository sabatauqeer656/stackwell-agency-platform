import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios.js';
import { createContentApi } from './contentApi.js';

// ['faqs'] is the public site's cache key (the FAQ page).
const faqs = createContentApi('faqs', { publicKeys: [['faqs']] });

export const useAdminFaqs = faqs.useList;
export const useAdminFaq = faqs.useOne;
export const useCreateFaq = faqs.useCreate;
export const useUpdateFaq = faqs.useUpdate;
export const useDeleteFaq = faqs.useDelete;

// The categories already in use (drafts too), offered as suggestions on the FAQ form so the same category is not
// typed two slightly different ways ("Pricing" and "pricing "). The API allows 50 per page, plenty for categories.
export function useFaqCategories() {
  return useQuery({
    // Filed under 'list' on purpose: every create, edit and delete refreshes that whole group (see contentApi.js),
    // so a category you just added is suggested straight away.
    queryKey: ['admin', 'faqs', 'list', 'categories'],
    queryFn: async () => {
      const items = (await api.get('/admin/faqs', { params: { limit: 50 } })).data.data;
      return [...new Set(items.map((faq) => faq.category))].sort();
    },
    staleTime: 60_000,
  });
}
