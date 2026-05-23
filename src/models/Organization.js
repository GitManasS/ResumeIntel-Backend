import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    domain: String,
    logo: String,
    website: String,
    industry: String,
    size: { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '500+'] },
    branding: {
      primaryColor: { type: String, default: '#0c87e8' },
      tagline: String,
      about: String,
    },
    settings: {
      timezone: { type: String, default: 'UTC' },
      careerPortalEnabled: { type: Boolean, default: true },
      defaultPipelineStages: [String],
    },
    plan: {
      type: String,
      enum: ['starter', 'growth', 'enterprise'],
      default: 'growth',
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

organizationSchema.index({ name: 'text' });

export default mongoose.model('Organization', organizationSchema);
