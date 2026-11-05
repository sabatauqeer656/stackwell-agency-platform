import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const USER_ROLES = ['admin', 'editor'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name must be at most 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // creates a unique index in MongoDB
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    // Stores the bcrypt HASH (added in the auth step), never the plain password.
    // select: false -> excluded from query results unless asked for with .select('+password')
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type: String,
      enum: { values: USER_ROLES, message: 'Role must be one of: ' + USER_ROLES.join(', ') },
      default: 'editor', // least privilege by default
    },
    isActive: {
      type: Boolean,
      default: true, // lets an admin disable an account without deleting it
    },
    // Incremented to invalidate all of this user's refresh tokens at once
    tokenVersion: {
      type: Number,
      default: 0,
      select: false,
    },
    lastLoginAt: Date,
  },
  {
    timestamps: true, // adds createdAt and updatedAt
    toJSON: {
      // Runs whenever a user is sent as JSON, so secrets can never leak in a response
      transform(doc, ret) {
        delete ret.password;
        delete ret.tokenVersion;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// bcrypt cost factor: each +1 doubles the time to hash, which slows down attackers too
const SALT_ROUNDS = 12;

// Runs before every save. Hash only when the password is new or changed,
// otherwise saving e.g. a name change would hash the hash.
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

// Compare a plain password with the stored hash. The hash must be loaded with .select('+password').
userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
