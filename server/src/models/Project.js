import mongoose from 'mongoose';

// A Project is a portfolio case study. It belongs to one Solution (its industry).
const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, minlength: 2, maxlength: 100 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    clientName: { type: String, required: [true, 'Client name is required'], trim: true, maxlength: 100 },

    // The relationship: stores only the Solution's _id. .populate('solution') swaps in the real document.
    solution: { type: mongoose.Schema.Types.ObjectId, ref: 'Solution', required: [true, 'Solution is required'] },

    summary: { type: String, required: [true, 'Summary is required'], trim: true, maxlength: 200 }, // card text
    challenge: { type: String, required: [true, 'Challenge is required'], trim: true, maxlength: 3000 },
    approach: { type: String, required: [true, 'Approach is required'], trim: true, maxlength: 3000 },
    results: { type: [String], default: [] }, // e.g. "Checkout time cut by 40%"
    techStack: { type: [String], default: [] }, // e.g. "React", "Node.js"

    // Image URLs (uploads to Cloudinary arrive in a later phase)
    coverImage: { type: String, trim: true },
    images: { type: [String], default: [] },
    liveUrl: { type: String, trim: true },

    completedAt: Date,
    isFeatured: { type: Boolean, default: false }, // shown on the home page
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

projectSchema.index({ isPublished: 1, isFeatured: 1, order: 1 });
projectSchema.index({ solution: 1 }); // fast "all projects of this industry" and the delete-in-use check

export default mongoose.model('Project', projectSchema);
