import mongoose from 'mongoose';

const talentPoolSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: String,
    tags: [String],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    candidates: [
      {
        candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
        resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
        addedAt: { type: Date, default: Date.now },
        notes: String,
      },
    ],
  },
  { timestamps: true }
);

talentPoolSchema.index({ organization: 1, name: 1 });

export default mongoose.model('TalentPool', talentPoolSchema);
