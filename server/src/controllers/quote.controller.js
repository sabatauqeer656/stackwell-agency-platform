import QuoteRequest from '../models/QuoteRequest.js';
import Service from '../models/Service.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { createLeadService } from '../services/lead.service.js';
import { DOWNLOAD_LINK_LIFETIME_SECONDS, deleteAttachments, getDownloadUrl, uploadAttachments } from '../services/storage.service.js';
import { createLeadController } from './lead.controller.js';

export const THANK_YOU = 'Thank you! We received your request and will send you a quote within 2 business days.';

const crud = createLeadService({
  Model: QuoteRequest,
  label: 'Quote request',
  searchFields: ['name', 'email', 'company', 'description'],
  // Every chosen service must exist and be published. Repeated ids are counted once.
  async beforeCreate(data) {
    if (!data.services?.length) return;
    const unique = [...new Set(data.services)];
    const found = await Service.countDocuments({ _id: { $in: unique }, isPublished: true });
    if (found !== unique.length) {
      throw new AppError('One or more selected services do not exist', 400, 'INVALID_REFERENCE', [
        { field: 'services', message: 'One or more selected services do not exist' },
      ]);
    }
    data.services = unique;
  },
  uploadFiles: uploadAttachments,
  discardFiles: deleteAttachments,
});

export const { createPublic, listAdmin, getAdmin, update, remove } = createLeadController(crud, {
  label: 'Quote request',
  thankYou: THANK_YOU,
});

// Admin only (the route sits behind protect + authorize). Returns a signed link that works for five
// minutes. The link is created fresh on every request, so it cannot be bookmarked or passed around for long.
export const downloadAttachment = asyncHandler(async (req, res) => {
  const quote = await crud.getById(req.params.id);
  const attachment = quote.attachments[req.params.index];
  if (!attachment) throw new AppError('Attachment not found', 404, 'NOT_FOUND');

  sendSuccess(res, {
    url: getDownloadUrl(attachment),
    originalName: attachment.originalName,
    expiresInSeconds: DOWNLOAD_LINK_LIFETIME_SECONDS,
  });
});
