import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: {
      type: String,
      enum: ['candidate', 'recruiter', 'admin', 'super_admin'],
      default: 'candidate',
      index: true,
    },
    platformRole: { type: String, enum: ['super_admin'] },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true },
    orgRole: {
      type: String,
      enum: ['org_admin', 'hr_manager', 'recruiter', 'interviewer'],
    },
    avatar: String,
    company: String,
    title: String,
    refreshToken: { type: String, select: false },
    passwordResetToken: String,
    passwordResetExpires: Date,
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

export default mongoose.model('User', userSchema);
