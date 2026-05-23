import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['ats_score', 'skill_distribution', 'jd_match', 'interview_progress', 'activity'],
      required: true,
    },
    metadata: mongoose.Schema.Types.Mixed,
    value: Number,
    label: String,
    recordedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

analyticsSchema.index({ user: 1, type: 1, recordedAt: -1 });

export default mongoose.model('Analytics', analyticsSchema);
