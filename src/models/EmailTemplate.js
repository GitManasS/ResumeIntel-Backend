import mongoose from 'mongoose';

const emailTemplateSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    category: {
      type: String,
      enum: ['interview', 'rejection', 'offer', 'follow_up', 'custom'],
      default: 'custom',
    },
    variables: [String],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

emailTemplateSchema.index({ organization: 1, slug: 1 }, { unique: true });

export default mongoose.model('EmailTemplate', emailTemplateSchema);
