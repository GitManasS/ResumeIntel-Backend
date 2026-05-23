import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    type: {
      type: String,
      enum: [
        'resume_upload',
        'application_submitted',
        'stage_changed',
        'note_added',
        'interview_scheduled',
        'ats_analyzed',
        'jd_matched',
        'login',
        'comment',
      ],
      required: true,
    },
    title: { type: String, required: true },
    description: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

activitySchema.index({ organization: 1, createdAt: -1 });
activitySchema.index({ candidate: 1, createdAt: -1 });
activitySchema.index({ application: 1, createdAt: -1 });

export default mongoose.model('Activity', activitySchema);
