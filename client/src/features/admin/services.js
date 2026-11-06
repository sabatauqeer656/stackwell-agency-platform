import { createContentApi } from './contentApi.js';

// ['services'] is the public site's cache key (it also covers ['services', slug]).
const services = createContentApi('services', { publicKeys: [['services']] });

export const useAdminServices = services.useList;
export const useAdminService = services.useOne;
export const useCreateService = services.useCreate;
export const useUpdateService = services.useUpdate;
export const useDeleteService = services.useDelete;
