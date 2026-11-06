import { createContentApi } from './contentApi.js';

// ['testimonials'] is the public site's cache key (the home page and the About page).
const testimonials = createContentApi('testimonials', { publicKeys: [['testimonials']] });

export const useAdminTestimonials = testimonials.useList;
export const useAdminTestimonial = testimonials.useOne;
export const useCreateTestimonial = testimonials.useCreate;
export const useUpdateTestimonial = testimonials.useUpdate;
export const useDeleteTestimonial = testimonials.useDelete;
