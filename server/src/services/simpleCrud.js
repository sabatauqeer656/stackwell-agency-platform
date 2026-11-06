import AppError from '../utils/AppError.js';
import { getPagination, buildMeta } from '../utils/pagination.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import { toUpdateOps } from '../utils/updateOps.js';
import { discardImages } from './storage.service.js';

// Shared logic for simple resources (no slug, no detail page): testimonials, team, FAQs.
// Each resource passes its Model and a few options and gets the six operations back.
//   label        - used in error messages, e.g. 'Testimonial'
//   searchField  - which field the admin search box looks in
//   sort         - default ordering
//   populate     - optional { path, select } to fill in a referenced document
//   beforeWrite  - optional async check run before create/update (e.g. "does the reference exist?")
//   imageFields  - optional names of fields that hold an uploaded image address (e.g. ['photo']). An image that a
//                  record stops using (replaced, removed, or the record deleted) is removed from Cloudinary.
export function createSimpleCrud({
  Model,
  label,
  searchField,
  sort = { order: 1, createdAt: -1 },
  populate,
  beforeWrite,
  imageFields = [],
}) {
  const notFound = () => new AppError(`${label} not found`, 404, 'NOT_FOUND');
  const withPopulate = (query) => (populate ? query.populate(populate.path, populate.select) : query);

  return {
    // Public: published items only, optionally narrowed by extra filters (e.g. FAQ category)
    listPublished: (extraFilter = {}) => withPopulate(Model.find({ ...extraFilter, isPublished: true }).sort(sort)),

    async listAdmin({ page, limit, search, published }) {
      const filter = {};
      if (search) filter[searchField] = { $regex: escapeRegex(search), $options: 'i' };
      if (published !== undefined) filter.isPublished = published;

      const pagination = getPagination({ page, limit });
      const [items, total] = await Promise.all([
        withPopulate(Model.find(filter).sort(sort).skip(pagination.skip).limit(pagination.limit)),
        Model.countDocuments(filter),
      ]);
      return { items, meta: buildMeta(pagination, total) };
    },

    async getById(id) {
      const doc = await withPopulate(Model.findById(id));
      if (!doc) throw notFound();
      return doc;
    },

    async create(data) {
      await beforeWrite?.(data);
      const doc = await Model.create(data);
      return populate ? doc.populate(populate.path, populate.select) : doc;
    },

    // A field sent as null is removed from the document (see utils/updateOps.js)
    async update(id, data) {
      await beforeWrite?.(data);
      const before = imageFields.length ? await Model.findById(id).select(imageFields.join(' ')).lean() : null;
      const doc = await withPopulate(Model.findByIdAndUpdate(id, toUpdateOps(data), { returnDocument: 'after', runValidators: true }));
      if (!doc) throw notFound();
      if (before) discardImages(imageFields.filter((field) => before[field] && before[field] !== doc[field]).map((field) => before[field])); // not awaited: cleanup must not slow down the save
      return doc;
    },

    async remove(id) {
      const doc = await Model.findByIdAndDelete(id);
      if (!doc) throw notFound();
      discardImages(imageFields.map((field) => doc[field]));
    },
  };
}
