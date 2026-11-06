import AppError from '../utils/AppError.js';
import { getPagination, buildMeta } from '../utils/pagination.js';
import { escapeRegex } from '../utils/escapeRegex.js';

// Shared logic for "leads": things visitors send us (inquiries, quote requests).
//   label         - used in messages, e.g. 'Inquiry'
//   searchFields  - fields the admin search box looks in
//   beforeCreate  - optional async check on the visitor's data (e.g. "do these services exist?")
//   uploadFiles   - optional: stores the uploaded files and returns what to save with the lead
//   discardFiles  - optional: deletes files that were stored (used when saving fails, or a lead is deleted)
//   afterCreate   - optional: runs in the BACKGROUND once the lead is saved (e.g. send emails). It is not awaited,
//                   so a slow or failing mail server can never delay or break the visitor's submission.
export function createLeadService({ Model, label, searchFields, beforeCreate, afterCreate, uploadFiles, discardFiles }) {
  const notFound = () => new AppError(`${label} not found`, 404, 'NOT_FOUND');

  return {
    // Public. Returns nothing: a visitor must never get stored data back.
    async create(data, files = []) {
      const { website, ...clean } = data; // the honeypot field is never saved
      await beforeCreate?.(clean);

      // Files are stored LAST, after every check has passed, so rejected requests never cost an upload
      const attachments = files.length > 0 && uploadFiles ? await uploadFiles(files) : [];
      let lead;
      try {
        lead = await Model.create({ ...clean, ...(uploadFiles && { attachments }) });
      } catch (error) {
        await discardFiles?.(attachments); // do not leave orphan files behind if saving the lead failed
        throw error;
      }

      // Fire and forget: the visitor's response does not wait for this
      if (afterCreate) {
        Promise.resolve()
          .then(() => afterCreate(lead))
          .catch((error) => console.error('Follow-up after saving a lead failed:', error.message));
      }
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
      await discardFiles?.(doc.attachments); // the files belong to the lead: they go with it
    },
  };
}
