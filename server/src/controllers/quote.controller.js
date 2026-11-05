import QuoteRequest from '../models/QuoteRequest.js';
import Service from '../models/Service.js';
import AppError from '../utils/AppError.js';
import { createLeadService } from '../services/lead.service.js';
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
});

export const { createPublic, listAdmin, getAdmin, update, remove } = createLeadController(crud, {
  label: 'Quote request',
  thankYou: THANK_YOU,
});
