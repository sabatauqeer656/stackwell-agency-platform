import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import * as solutions from '../services/solution.service.js';

// ---------- Public ----------
export const listPublic = asyncHandler(async (req, res) => {
  sendSuccess(res, await solutions.listPublished());
});

export const getPublic = asyncHandler(async (req, res) => {
  sendSuccess(res, await solutions.getPublishedBySlug(req.params.slug));
});

// ---------- Admin ----------
export const listAdmin = asyncHandler(async (req, res) => {
  const { items, meta } = await solutions.listAdmin(req.query);
  sendSuccess(res, items, { meta });
});

export const getAdmin = asyncHandler(async (req, res) => {
  sendSuccess(res, await solutions.getById(req.params.id));
});

export const create = asyncHandler(async (req, res) => {
  sendSuccess(res, await solutions.createSolution(req.body), { status: 201 });
});

export const update = asyncHandler(async (req, res) => {
  sendSuccess(res, await solutions.updateSolution(req.params.id, req.body));
});

export const remove = asyncHandler(async (req, res) => {
  await solutions.deleteSolution(req.params.id);
  sendSuccess(res, { message: 'Solution deleted' });
});
