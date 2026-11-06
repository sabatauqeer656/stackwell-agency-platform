import mongoose from 'mongoose';
import { QUOTE_STATUSES, PROJECT_TYPES, BUDGET_RANGES, TIMELINES } from '../constants/leads.js';

// A file the visitor attached. The file itself lives at Cloudinary (private); only its details are kept here.
const attachmentSchema = new mongoose.Schema(
  {
    publicId: { type: String, required: true }, // Cloudinary's id for the file (random, reveals nothing)
    resourceType: { type: String, required: true }, // 'image' or 'raw': Cloudinary needs it to find the file
    format: { type: String, default: '' },
    originalName: { type: String, required: true, maxlength: 100 }, // shown to the team, already cleaned
    mimeType: { type: String, required: true },
    size: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

// A request submitted through the multi-step quote wizard.
const quoteRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, trim: true, maxlength: 30 },
    company: { type: String, trim: true, maxlength: 100 },

    projectType: { type: String, enum: PROJECT_TYPES, required: true },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }], // services of interest
    budgetRange: { type: String, enum: BUDGET_RANGES, required: true },
    timeline: { type: String, enum: TIMELINES, required: true },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    attachments: {
      type: [attachmentSchema],
      default: [],
      validate: { validator: (list) => list.length <= 3, message: 'At most 3 attachments are allowed' },
    },

    // The sales pipeline. Visitors cannot set it; new requests always start as 'new'.
    status: { type: String, enum: QUOTE_STATUSES, default: 'new' },
    notes: { type: String, trim: true, maxlength: 2000 }, // internal
  },
  { timestamps: true, versionKey: false }
);

quoteRequestSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('QuoteRequest', quoteRequestSchema);
