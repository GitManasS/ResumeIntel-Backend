import JDMatch from '../models/JDMatch.js';
import Resume from '../models/Resume.js';
import Analytics from '../models/Analytics.js';
import { ApiError } from '../utils/ApiError.js';
import { aiService } from '../ai/ai.service.js';

export const jdMatchService = {
  async createMatch(userId, { resumeId, jobDescription, jobTitle }) {
    const resume = await Resume.findOne({ _id: resumeId, user: userId, status: 'ready' });
    if (!resume) throw ApiError.notFound('Resume not found or not ready');

    const skills = resume.parsedData?.skills || [];
    const match = await aiService.matchJobDescription(skills, jobDescription, jobTitle);

    const jdMatch = await JDMatch.create({
      user: userId,
      resume: resumeId,
      jobDescription,
      jobTitle,
      ...match,
    });

    await Analytics.create({
      user: userId,
      type: 'jd_match',
      value: match.matchPercentage,
      label: jobTitle || 'JD Match',
      metadata: { jdMatchId: jdMatch._id, resumeId },
    });

    return jdMatch;
  },

  async getHistory(userId, { page, limit, skip, sort }) {
    const [matches, total] = await Promise.all([
      JDMatch.find({ user: userId })
        .populate('resume', 'title fileName')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      JDMatch.countDocuments({ user: userId }),
    ]);
    return { matches, total };
  },

  async getById(matchId, userId) {
    const match = await JDMatch.findOne({ _id: matchId, user: userId }).populate('resume');
    if (!match) throw ApiError.notFound('Match not found');
    return match;
  },
};

export default jdMatchService;
