import TeamMember from '../models/TeamMember.js';
import { createSimpleCrud } from '../services/simpleCrud.js';
import { createSimpleController } from './simpleCrud.controller.js';

const crud = createSimpleCrud({ Model: TeamMember, label: 'Team member', searchField: 'name', imageFields: ['photo'] });

export const { listPublic, listAdmin, getAdmin, create, update, remove } = createSimpleController(crud, {
  label: 'Team member',
});
