import mongoose from 'mongoose';
import { INQUIRY_STATUSES } from '../constants/leads.js';

// A message sent through the public contact form.
const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, trim: true, maxlength: 30 },
    company: { type: String, trim: true, maxlength: 100 },
    subject: { type: String, required: true, trim: true, maxlength: 150 },
    message: { type: String, required: true, trim: true, maxlength: 3000 },

    // Set by the team only. A visitor can never choose it (new inquiries always start as 'new').
    status: { type: String, enum: INQUIRY_STATUSES, default: 'new' },
    notes: { type: String, trim: true, maxlength: 2000 }, // internal, never shown publicly
  },
  { timestamps: true, versionKey: false }
);

inquirySchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Inquiry', inquirySchema);
