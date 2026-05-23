import mongoose from 'mongoose';
import { PIPELINE_STAGE_IDS } from '../config/pipeline.js';

const stageHistorySchema = new mongoose.Schema(
  {
    fromStage: String,
    toStage: { type: String, required: true },
    movedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: String,
    movedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const applicationSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
    stage: {
      type: String,
      enum: PIPELINE_STAGE_IDS,
      default: 'applied',
      index: true,
    },
    matchScore: { type: Number, min: 0, max: 100 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedInterviewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    source: { type: String, enum: ['career_portal', 'referral', 'linkedin', 'internal', 'other'], default: 'career_portal' },
    expectedSalary: Number,
    noticePeriodDays: Number,
    location: String,
    tags: [String],
    stageHistory: [stageHistorySchema],
    rejectedAt: Date,
    hiredAt: Date,
  },
  { timestamps: true }
);

applicationSchema.index({ organization: 1, job: 1, stage: 1 });
applicationSchema.index({ organization: 1, candidate: 1 });
applicationSchema.index({ organization: 1, createdAt: -1 });

export default mongoose.model('Application', applicationSchema);
