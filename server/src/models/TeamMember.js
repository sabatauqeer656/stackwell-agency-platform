import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, minlength: 2, maxlength: 100 },
    role: { type: String, required: [true, 'Role is required'], trim: true, maxlength: 100 }, // job title
    bio: { type: String, required: [true, 'Bio is required'], trim: true, maxlength: 500 },
    photo: { type: String, trim: true }, // image URL
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

teamMemberSchema.index({ isPublished: 1, order: 1 });

export default mongoose.model('TeamMember', teamMemberSchema);
