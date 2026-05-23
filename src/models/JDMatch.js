import mongoose from 'mongoose';

const jdMatchSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
    jobDescription: { type: String, required: true },
    jobTitle: String,
    matchPercentage: { type: Number, min: 0, max: 100 },
    missingSkills: [String],
    matchedSkills: [String],
    keywordGaps: [String],
    recommendations: [String],
  },
  { timestamps: true }
);

export default mongoose.model('JDMatch', jdMatchSchema);
