import Solution from '../models/Solution.js';
import Project from '../models/Project.js';
import AppError from '../utils/AppError.js';
import { slugify, uniqueSlug } from '../utils/slugify.js';
import { getPagination, buildMeta } from '../utils/pagination.js';
import { escapeRegex } from '../utils/escapeRegex.js';

const notFound = () => new AppError('Solution not found', 404, 'NOT_FOUND');

// ---------- Public ----------
export const listPublished = () => Solution.find({ isPublished: true }).sort({ order: 1, title: 1 });

export async function getPublishedBySlug(slug) {
  const solution = await Solution.findOne({ slug, isPublished: true });
  if (!solution) throw notFound();
  return solution;
}

// ---------- Admin ----------
export async function listAdmin({ page, limit, search, published }) {
  const filter = {};
  if (search) filter.title = { $regex: escapeRegex(search), $options: 'i' };
  if (published !== undefined) filter.isPublished = published;

  const pagination = getPagination({ page, limit });
  const [items, total] = await Promise.all([
    Solution.find(filter).sort({ order: 1, title: 1 }).skip(pagination.skip).limit(pagination.limit),
    Solution.countDocuments(filter),
  ]);
  return { items, meta: buildMeta(pagination, total) };
}

export async function getById(id) {
  const solution = await Solution.findById(id);
  if (!solution) throw notFound();
  return solution;
}

export async function createSolution(data) {
  const slug = await uniqueSlug(Solution, data.slug ?? slugify(data.title));
  return Solution.create({ ...data, slug });
}

export async function updateSolution(id, data) {
  if (data.slug) data.slug = await uniqueSlug(Solution, data.slug, id);
  const solution = await Solution.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
  if (!solution) throw notFound();
  return solution;
}

export async function deleteSolution(id) {
  // Projects point at a Solution. Deleting it would leave them with a dangling reference,
  // so refuse and tell the admin what to do first.
  const inUse = await Project.countDocuments({ solution: id });
  if (inUse > 0) {
    throw new AppError(
      `This solution is used by ${inUse} project${inUse === 1 ? '' : 's'}. Move or delete them first.`,
      409,
      'IN_USE'
    );
  }
  const solution = await Solution.findByIdAndDelete(id);
  if (!solution) throw notFound();
}
