import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: [true, 'Client name is required'], trim: true, maxlength: 100 },
    clientRole: { type: String, required: [true, 'Client role is required'], trim: true, maxlength: 100 },
    company: { type: String, trim: true, maxlength: 100 },
    quote: { type: String, required: [true, 'Quote is required'], trim: true, maxlength: 600 },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    avatar: { type: String, trim: true }, // image URL
    // Optional link to the project this client is talking about
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

testimonialSchema.index({ isPublished: 1, order: 1 });

export default mongoose.model('Testimonial', testimonialSchema);
