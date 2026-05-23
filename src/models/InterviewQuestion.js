import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    category: {
      type: String,
      enum: ['hr', 'technical', 'project-based', 'behavioral'],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    suggestedAnswer: String,
    tips: [String],
  },
  { _id: true }
);

const interviewQuestionSetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
    targetRole: String,
    skills: [String],
    questions: [questionSchema],
  },
  { timestamps: true }
);

export default mongoose.model('InterviewQuestion', interviewQuestionSetSchema);
