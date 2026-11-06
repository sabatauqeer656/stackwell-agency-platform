import { createContentApi } from './contentApi.js';

// A solution's title is shown on its projects, so project data is refreshed too. (Keys are prefixes.)
const solutions = createContentApi('solutions', { publicKeys: [['solutions'], ['projects']] });

export const useAdminSolutions = solutions.useList;
export const useAdminSolution = solutions.useOne;
export const useCreateSolution = solutions.useCreate;
export const useUpdateSolution = solutions.useUpdate;
export const useDeleteSolution = solutions.useDelete;
