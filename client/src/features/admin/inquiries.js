import { createLeadApi, LEAD_PAGE_SIZE } from './leadApi.js';

export const INQUIRY_PAGE_SIZE = LEAD_PAGE_SIZE;
export const INQUIRY_STATUSES = ['new', 'read', 'replied', 'archived'];

const inquiries = createLeadApi('inquiries');

export const useInquiries = inquiries.useList;
export const useInquiry = inquiries.useOne;
export const useUpdateInquiry = inquiries.useUpdate;
export const useDeleteInquiry = inquiries.useDelete;
