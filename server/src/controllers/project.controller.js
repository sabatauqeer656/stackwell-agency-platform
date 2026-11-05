import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import * as projects from '../services/project.service.js';

// ---------- Public ----------
export const listPublic = asyncHandler(async (req, res) => {
  const { items, meta } = await projects.listPublished(req.query);
  sendSuccess(res, items, { meta });
});

export const getPublic = asyncHandler(async (req, res) => {
  sendSuccess(res, await projects.getPublishedBySlug(req.params.slug));
});

// ---------- Admin ----------
export const listAdmin = asyncHandler(async (req, res) => {
  const { items, meta } = await projects.listAdmin(req.query);
  sendSuccess(res, items, { meta });
});

export const getAdmin = asyncHandler(async (req, res) => {
  sendSuccess(res, await projects.getById(req.params.id));
});

export const create = asyncHandler(async (req, res) => {
  sendSuccess(res, await projects.createProject(req.body), { status: 201 });
});

export const update = asyncHandler(async (req, res) => {
  sendSuccess(res, await projects.updateProject(req.params.id, req.body));
});

export const remove = asyncHandler(async (req, res) => {
  await projects.deleteProject(req.params.id);
  sendSuccess(res, { message: 'Project deleted' });
});
