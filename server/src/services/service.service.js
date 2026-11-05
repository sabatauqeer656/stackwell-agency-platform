import Service from '../models/Service.js';
import AppError from '../utils/AppError.js';
import { slugify, uniqueSlug } from '../utils/slugify.js';
import { getPagination, buildMeta } from '../utils/pagination.js';

const notFound = () => new AppError('Service not found', 404, 'NOT_FOUND');
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ---------- Public: only published services ----------

export const listPublished = () => Service.find({ isPublished: true }).sort({ order: 1, title: 1 });

export async function getPublishedBySlug(slug) {
  const service = await Service.findOne({ slug, isPublished: true });
  if (!service) throw notFound(); // drafts look exactly like "does not exist"
  return service;
}

// ---------- Admin: everything, including drafts ----------

export async function listAdmin({ page, limit, search, published }) {
  const filter = {};
  if (search) filter.title = { $regex: escapeRegex(search), $options: 'i' };
  if (published !== undefined) filter.isPublished = published;

  const pagination = getPagination({ page, limit });
  const [items, total] = await Promise.all([
    Service.find(filter).sort({ order: 1, title: 1 }).skip(pagination.skip).limit(pagination.limit),
    Service.countDocuments(filter),
  ]);
  return { items, meta: buildMeta(pagination, total) };
}

export async function getById(id) {
  const service = await Service.findById(id);
  if (!service) throw notFound();
  return service;
}

export async function createService(data) {
  const slug = await uniqueSlug(Service, data.slug ?? slugify(data.title));
  return Service.create({ ...data, slug });
}

export async function updateService(id, data) {
  // A changed slug is re-checked for uniqueness. The slug is NOT regenerated from a new
  // title on its own, so public URLs do not break when someone fixes a typo.
  if (data.slug) data.slug = await uniqueSlug(Service, data.slug, id);

  const service = await Service.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
  if (!service) throw notFound();
  return service;
}

export async function deleteService(id) {
  const service = await Service.findByIdAndDelete(id);
  if (!service) throw notFound();
}
