import Inquiry from '../models/Inquiry.js';
import { createLeadService } from '../services/lead.service.js';
import { createLeadController } from './lead.controller.js';

export const THANK_YOU = 'Thank you! Your message has been sent. We will get back to you within 24 hours.';

const crud = createLeadService({
  Model: Inquiry,
  label: 'Inquiry',
  searchFields: ['name', 'email', 'subject', 'company'],
});

export const { createPublic, listAdmin, getAdmin, update, remove } = createLeadController(crud, {
  label: 'Inquiry',
  thankYou: THANK_YOU,
});
