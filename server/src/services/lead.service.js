import AppError from '../utils/AppError.js';
import { getPagination, buildMeta } from '../utils/pagination.js';
import { escapeRegex } from '../utils/escapeRegex.js';

// Shared logic for "leads": things visitors send us (inquiries, quote requests).
//   label         - used in messages, e.g. 'Inquiry'
//   searchFields  - fields the admin search box looks in
//   beforeCreate  - optional async check on the visitor's data (e.g. "do these services exist?")
export function createLeadService({ Model, label, searchFields, beforeCreate }) {
  const notFound = () => new AppError(`${label} not found`, 404, 'NOT_FOUND');

  return {
    // Public. Returns nothing: a visitor must never get stored data back.
    async create(data) {
      const { website, ...clean } = data; // the honeypot field is never saved
      await beforeCreate?.(clean);
      await Model.create(clean);
    },

    async listAdmin({ page, limit, status, search }) {
      const filter = {};
      if (status) filter.status = status;
      if (search) {
        const regex = { $regex: escapeRegex(search), $options: 'i' };
        filter.$or = searchFields.map((field) => ({ [field]: regex }));
      }

      const pagination = getPagination({ page, limit });
      const [items, total] = await Promise.all([
        Model.find(filter).sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.limit),
        Model.countDocuments(filter),
      ]);
      return { items, meta: buildMeta(pagination, total) };
    },

    async getById(id) {
      const doc = await Model.findById(id);
      if (!doc) throw notFound();
      return doc;
    },

    // Admins can only change status and notes (the validator allows nothing else)
    async update(id, data) {
      const doc = await Model.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
      if (!doc) throw notFound();
      return doc;
    },

    async remove(id) {
      const doc = await Model.findByIdAndDelete(id);
      if (!doc) throw notFound();
    },
  };
}
