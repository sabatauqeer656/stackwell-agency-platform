import mongoose from 'mongoose';

// There is exactly ONE settings document. The fixed, unique `key` guarantees that:
// a second document with key 'main' is rejected by the database.
const siteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true, immutable: true },
    companyName: { type: String, default: 'Stackwell', trim: true, maxlength: 100 },
    tagline: { type: String, default: 'We build software that moves your business forward.', trim: true, maxlength: 200 },
    email: { type: String, default: 'hello@stackwell.example', trim: true, lowercase: true },
    phone: { type: String, default: '', trim: true, maxlength: 30 },
    address: { type: String, default: '', trim: true, maxlength: 200 },
    linkedin: { type: String, default: '', trim: true },
    github: { type: String, default: '', trim: true },
    twitter: { type: String, default: '', trim: true },
    instagram: { type: String, default: '', trim: true },
    footerText: { type: String, default: '', trim: true, maxlength: 300 },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      // The internal key is a database detail, not part of the public API
      transform(doc, ret) {
        delete ret.key;
        return ret;
      },
    },
  }
);

export default mongoose.model('SiteSettings', siteSettingsSchema);
