import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

// Builds the request handlers for a lead resource from its service (see services/lead.service.js).
//   label        - 'Inquiry' / 'Quote request', used in messages
//   thankYou     - text shown to the visitor after a successful submission
export function createLeadController(crud, { label, thankYou }) {
  return {
    createPublic: asyncHandler(async (req, res) => {
      await crud.create(req.body);
      sendSuccess(res, { message: thankYou }, { status: 201 });
    }),

    listAdmin: asyncHandler(async (req, res) => {
      const { items, meta } = await crud.listAdmin(req.query);
      sendSuccess(res, items, { meta });
    }),

    getAdmin: asyncHandler(async (req, res) => {
      sendSuccess(res, await crud.getById(req.params.id));
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
