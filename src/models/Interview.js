import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    interviewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    type: {
      type: String,
      enum: ['phone', 'video', 'onsite', 'technical', 'hr', 'panel'],
      default: 'video',
    },
    title: { type: String, required: true },
    scheduledAt: { type: Date, required: true, index: true },
    durationMinutes: { type: Number, default: 60 },
    timezone: { type: String, default: 'UTC' },
    meetingLink: String,
    location: String,
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'no_show'],
      default: 'scheduled',
    },
    notes: String,
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Interview', interviewSchema);
