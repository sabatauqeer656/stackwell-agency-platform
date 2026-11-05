import Project from '../models/Project.js';
import Solution from '../models/Solution.js';
import AppError from '../utils/AppError.js';
import { slugify, uniqueSlug } from '../utils/slugify.js';
import { getPagination, buildMeta } from '../utils/pagination.js';
import { escapeRegex } from '../utils/escapeRegex.js';

const notFound = () => new AppError('Project not found', 404, 'NOT_FOUND');

// Replace the stored Solution id with { title, slug } so the UI can show the industry name.
const withSolution = (query) => query.populate('solution', 'title slug');

async function assertSolutionExists(id) {
  if (!(await Solution.exists({ _id: id }))) {
    throw new AppError('Solution not found', 400, 'INVALID_REFERENCE', [
      { field: 'solution', message: 'No solution with this id exists' },
    ]);
  }
}

async function paginate(filter, { page, limit }) {
  const pagination = getPagination({ page, limit });
  const [items, total] = await Promise.all([
    withSolution(Project.find(filter).sort({ order: 1, createdAt: -1 }).skip(pagination.skip).limit(pagination.limit)),
    Project.countDocuments(filter),
  ]);
  return { items, meta: buildMeta(pagination, total) };
}

// ---------- Public ----------
export async function listPublished({ page, limit, industry, featured }) {
  const filter = { isPublished: true };
  if (featured) filter.isFeatured = true;

  if (industry) {
    // The URL uses the industry's slug; the database stores its _id
    const solution = await Solution.findOne({ slug: industry }).select('_id');
    if (!solution) {
      return { items: [], meta: buildMeta(getPagination({ page, limit }), 0) };
    }
    filter.solution = solution._id;
  }
  return paginate(filter, { page, limit });
}

export async function getPublishedBySlug(slug) {
  const project = await withSolution(Project.findOne({ slug, isPublished: true }));
  if (!project) throw notFound();
  return project;
}

// ---------- Admin ----------
export async function listAdmin({ page, limit, search, published }) {
  const filter = {};
  if (search) filter.title = { $regex: escapeRegex(search), $options: 'i' };
  if (published !== undefined) filter.isPublished = published;
  return paginate(filter, { page, limit });
}

export async function getById(id) {
  const project = await withSolution(Project.findById(id));
  if (!project) throw notFound();
  return project;
}

export async function createProject(data) {
  await assertSolutionExists(data.solution);
  const slug = await uniqueSlug(Project, data.slug ?? slugify(data.title));
  const project = await Project.create({ ...data, slug });
  return project.populate('solution', 'title slug');
}

export async function updateProject(id, data) {
  if (data.solution) await assertSolutionExists(data.solution);
  if (data.slug) data.slug = await uniqueSlug(Project, data.slug, id);

  const project = await withSolution(Project.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true }));
  if (!project) throw notFound();
  return project;
}

export async function deleteProject(id) {
  const project = await Project.findByIdAndDelete(id);
  if (!project) throw notFound();
}
