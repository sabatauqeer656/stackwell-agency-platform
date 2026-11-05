import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: [true, 'Question is required'], trim: true, maxlength: 200 },
    answer: { type: String, required: [true, 'Answer is required'], trim: true, maxlength: 2000 },
    category: { type: String, trim: true, default: 'General', maxlength: 50 }, // e.g. Pricing, Process
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

faqSchema.index({ isPublished: 1, category: 1, order: 1 });

export default mongoose.model('Faq', faqSchema);
