import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    // URL-friendly id used by the public site: /services/custom-web-applications
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    summary: {
      type: String,
      required: [true, 'Summary is required'],
      trim: true,
      maxlength: 200, // shown on cards
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 5000, // shown on the detail page
    },
    icon: { type: String, trim: true, default: 'Code', maxlength: 40 }, // a lucide-react icon name
    features: { type: [String], default: [] },
    order: { type: Number, default: 0 }, // lower numbers show first
    isPublished: { type: Boolean, default: true }, // false = draft, hidden from the public site
  },
  { timestamps: true, versionKey: false }
);

// Speeds up the public list query: published services sorted by order
serviceSchema.index({ isPublished: 1, order: 1 });

export default mongoose.model('Service', serviceSchema);
