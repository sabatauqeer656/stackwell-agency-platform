import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

// Builds the six request handlers for a resource from its crud object (see services/simpleCrud.js).
//   publicFilter - optional (req) => filter, to support query params like ?category=
export function createSimpleController(crud, { label, publicFilter } = {}) {
  return {
    listPublic: asyncHandler(async (req, res) => {
      sendSuccess(res, await crud.listPublished(publicFilter?.(req)));
    }),

    listAdmin: asyncHandler(async (req, res) => {
      const { items, meta } = await crud.listAdmin(req.query);
      sendSuccess(res, items, { meta });
    }),

    getAdmin: asyncHandler(async (req, res) => {
      sendSuccess(res, await crud.getById(req.params.id));
    }),

    create: asyncHandler(async (req, res) => {
      sendSuccess(res, await crud.create(req.body), { status: 201 });
    }),

    update: asyncHandler(async (req, res) => {
      sendSuccess(res, await crud.update(req.params.id, req.body));
    }),

    remove: asyncHandler(async (req, res) => {
      await crud.remove(req.params.id);
      sendSuccess(res, { message: `${label} deleted` });
    }),
  };
}
