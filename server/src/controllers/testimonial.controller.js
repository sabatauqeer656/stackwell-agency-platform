import Testimonial from '../models/Testimonial.js';
import Project from '../models/Project.js';
import AppError from '../utils/AppError.js';
import { createSimpleCrud } from '../services/simpleCrud.js';
import { createSimpleController } from './simpleCrud.controller.js';

const crud = createSimpleCrud({
  Model: Testimonial,
  label: 'Testimonial',
  searchField: 'clientName',
  populate: { path: 'project', select: 'title slug' },
  // A testimonial may point at a project, but only one that exists
  async beforeWrite(data) {
    if (data.project && !(await Project.exists({ _id: data.project }))) {
      throw new AppError('Project not found', 400, 'INVALID_REFERENCE', [
        { field: 'project', message: 'No project with this id exists' },
      ]);
    }
  },
});

export const { listPublic, listAdmin, getAdmin, create, update, remove } = createSimpleController(crud, {
  label: 'Testimonial',
});
