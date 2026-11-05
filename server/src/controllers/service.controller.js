import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import * as services from '../services/service.service.js';

// ---------- Public ----------
export const listPublic = asyncHandler(async (req, res) => {
  sendSuccess(res, await services.listPublished());
});

export const getPublic = asyncHandler(async (req, res) => {
  sendSuccess(res, await services.getPublishedBySlug(req.params.slug));
});

// ---------- Admin ----------
export const listAdmin = asyncHandler(async (req, res) => {
  const { items, meta } = await services.listAdmin(req.query);
  sendSuccess(res, items, { meta });
});

export const getAdmin = asyncHandler(async (req, res) => {
  sendSuccess(res, await services.getById(req.params.id));
});

export const create = asyncHandler(async (req, res) => {
  sendSuccess(res, await services.createService(req.body), { status: 201 });
});

export const update = asyncHandler(async (req, res) => {
  sendSuccess(res, await services.updateService(req.params.id, req.body));
});

export const remove = asyncHandler(async (req, res) => {
  await services.deleteService(req.params.id);
  sendSuccess(res, { message: 'Service deleted' });
});
