import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      index: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true, index: true },
    company: { type: String, required: true, trim: true },
    department: String,
    location: String,
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
      default: 'full-time',
    },
    description: { type: String, required: true },
    requirements: [String],
    skills: [String],
    salary: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'USD' },
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'closed'],
      default: 'active',
      index: true,
    },
    applicants: [
      {
        candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
        matchScore: Number,
        status: {
          type: String,
          enum: ['applied', 'shortlisted', 'rejected', 'interview'],
          default: 'applied',
        },
        appliedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', description: 'text', skills: 'text' });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ organization: 1, status: 1, createdAt: -1 });

export default mongoose.model('Job', jobSchema);
