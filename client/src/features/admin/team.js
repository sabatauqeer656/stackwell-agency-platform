import { createContentApi } from './contentApi.js';

// ['team'] is the public site's cache key (the team section on the About page).
const team = createContentApi('team', { publicKeys: [['team']] });

export const useAdminTeam = team.useList;
export const useAdminTeamMember = team.useOne;
export const useCreateTeamMember = team.useCreate;
export const useUpdateTeamMember = team.useUpdate;
export const useDeleteTeamMember = team.useDelete;
