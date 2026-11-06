import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios.js';
import { createContentApi } from './contentApi.js';

// ['projects'] covers the public list, the featured list on the home page and every project page.
const projects = createContentApi('projects', { publicKeys: [['projects']] });

export const useAdminProjects = projects.useList;
export const useAdminProject = projects.useOne;
export const useCreateProject = projects.useCreate;
export const useUpdateProject = projects.useUpdate;
export const useDeleteProject = projects.useDelete;

// Every solution (drafts too) for the "Solution" dropdown on the project form. The API allows 50 per page, plenty here.
export function useSolutionChoices() {
  return useQuery({
    queryKey: ['admin', 'solutions', 'choices'],
    queryFn: async () => (await api.get('/admin/solutions', { params: { limit: 50 } })).data.data,
  });
}
