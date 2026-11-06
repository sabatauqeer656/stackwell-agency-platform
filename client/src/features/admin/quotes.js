import { useMutation } from '@tanstack/react-query';
import api from '../../lib/axios.js';
import { createLeadApi } from './leadApi.js';

export const QUOTE_STATUSES = ['new', 'reviewing', 'proposal-sent', 'won', 'lost'];

const quotes = createLeadApi('quotes');

export const useQuotes = quotes.useList;
export const useQuote = quotes.useOne;
export const useUpdateQuote = quotes.useUpdate;
export const useDeleteQuote = quotes.useDelete;

// Attachments are private. Asking the server for a download gives a link that stops working after 5 minutes.
export function useDownloadAttachment() {
  return useMutation({
    mutationFn: async ({ quoteId, index }) => (await api.get(`/admin/quotes/${quoteId}/attachments/${index}/download`)).data.data,
  });
}
