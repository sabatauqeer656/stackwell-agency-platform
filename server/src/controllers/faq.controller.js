import Faq from '../models/Faq.js';
import { createSimpleCrud } from '../services/simpleCrud.js';
import { createSimpleController } from './simpleCrud.controller.js';

const crud = createSimpleCrud({
  Model: Faq,
  label: 'FAQ',
  searchField: 'question',
  sort: { category: 1, order: 1, createdAt: 1 }, // grouped by category, then by order
});

export const { listPublic, listAdmin, getAdmin, create, update, remove } = createSimpleController(crud, {
  label: 'FAQ',
  publicFilter: (req) => (req.query.category ? { category: req.query.category } : {}),
});
