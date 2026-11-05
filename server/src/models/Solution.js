import mongoose from 'mongoose';

// A Solution is an industry we serve (fintech, healthcare...). Projects belong to one.
const solutionSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, minlength: 2, maxlength: 100 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    summary: { type: String, required: [true, 'Summary is required'], trim: true, maxlength: 200 },
    description: { type: String, required: [true, 'Description is required'], trim: true, maxlength: 5000 },
    icon: { type: String, trim: true, default: 'Briefcase', maxlength: 40 }, // a lucide-react icon name
    challenges: { type: [String], default: [] }, // problems this industry faces that we solve
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

solutionSchema.index({ isPublished: 1, order: 1 });

export default mongoose.model('Solution', solutionSchema);
