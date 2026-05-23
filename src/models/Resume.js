import mongoose from 'mongoose';

const parsedDataSchema = new mongoose.Schema(
  {
    skills: [String],
    education: [
      {
        institution: String,
        degree: String,
        field: String,
        startYear: Number,
        endYear: Number,
      },
    ],
    experience: [
      {
        company: String,
        title: String,
        startDate: String,
        endDate: String,
        description: String,
      },
    ],
    projects: [
      {
        name: String,
        description: String,
        technologies: [String],
      },
    ],
    certifications: [{ name: String, issuer: String, year: Number }],
    summary: String,
    rawText: String,
  },
  { _id: false }
);

const atsAnalysisSchema = new mongoose.Schema(
  {
    score: { type: Number, min: 0, max: 100 },
    formattingSuggestions: [String],
    missingKeywords: [String],
    improvementTips: [String],
    analyzedAt: Date,
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'My Resume' },
    fileUrl: String,
    filePublicId: String,
    fileName: String,
    fileType: { type: String, enum: ['pdf', 'doc', 'docx'] },
    parsedData: parsedDataSchema,
    atsAnalysis: atsAnalysisSchema,
    isPrimary: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['uploading', 'parsing', 'ready', 'failed'],
      default: 'uploading',
    },
  },
  { timestamps: true }
);

resumeSchema.index({ user: 1, createdAt: -1 });
resumeSchema.index({ 'parsedData.skills': 1 });

export default mongoose.model('Resume', resumeSchema);
