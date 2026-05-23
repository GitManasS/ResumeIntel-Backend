import mongoose from 'mongoose';

const automationRuleSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true },
    trigger: {
      event: {
        type: String,
        enum: [
          'application.created',
          'application.stage_changed',
          'interview.scheduled',
          'candidate.shortlisted',
        ],
        required: true,
      },
      stage: String,
    },
    actions: [
      {
        type: { type: String, enum: ['send_email', 'notify_user', 'assign_owner'], required: true },
        templateSlug: String,
        notifyRole: String,
        metadata: mongoose.Schema.Types.Mixed,
      },
    ],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('AutomationRule', automationRuleSchema);
