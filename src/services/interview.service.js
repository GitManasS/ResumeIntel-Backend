import InterviewQuestion from '../models/InterviewQuestion.js';
import Resume from '../models/Resume.js';
import { ApiError } from '../utils/ApiError.js';
import { aiService } from '../ai/ai.service.js';

export const interviewService = {
  async generate(userId, { resumeId, targetRole, skills }) {
    let resumeSummary = '';
    let resumeSkills = skills || [];

    if (resumeId) {
      const resume = await Resume.findOne({ _id: resumeId, user: userId, status: 'ready' });
      if (!resume) throw ApiError.notFound('Resume not found');
      resumeSummary = resume.parsedData?.summary || resume.parsedData?.rawText?.slice(0, 500);
      resumeSkills = resume.parsedData?.skills || resumeSkills;
    }

    const questions = await aiService.generateInterviewQuestions(
      resumeSummary,
      resumeSkills,
      targetRole
    );

    const questionSet = await InterviewQuestion.create({
      user: userId,
      resume: resumeId,
      targetRole,
      skills: resumeSkills,
      questions,
    });

    return questionSet;
  },

  async getHistory(userId, { page, limit, skip, sort }) {
    const [sets, total] = await Promise.all([
      InterviewQuestion.find({ user: userId })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-questions.suggestedAnswer'),
      InterviewQuestion.countDocuments({ user: userId }),
    ]);
    return { sets, total };
  },

  async getById(setId, userId) {
    const set = await InterviewQuestion.findOne({ _id: setId, user: userId });
    if (!set) throw ApiError.notFound('Question set not found');
    return set;
  },
};

export default interviewService;
