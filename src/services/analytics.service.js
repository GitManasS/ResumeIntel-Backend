import Analytics from '../models/Analytics.js';
import Resume from '../models/Resume.js';
import Job from '../models/Job.js';
import User from '../models/User.js';

export const analyticsService = {
  async getCandidateAnalytics(userId) {
    const [atsScores, jdMatches, resumes] = await Promise.all([
      Analytics.find({ user: userId, type: 'ats_score' })
        .sort({ recordedAt: -1 })
        .limit(30)
        .lean(),
      Analytics.find({ user: userId, type: 'jd_match' })
        .sort({ recordedAt: -1 })
        .limit(10)
        .lean(),
      Resume.find({ user: userId, status: 'ready' }).lean(),
    ]);

    const skillMap = {};
    resumes.forEach((r) => {
      (r.parsedData?.skills || []).forEach((skill) => {
        skillMap[skill] = (skillMap[skill] || 0) + 1;
      });
    });

    const skillDistribution = Object.entries(skillMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    const atsTrend = atsScores.map((a) => ({
      date: a.recordedAt,
      score: a.value,
      label: a.label,
    }));

    const avgAts =
      atsScores.length > 0
        ? Math.round(atsScores.reduce((s, a) => s + a.value, 0) / atsScores.length)
        : 0;

    return {
      summary: {
        totalResumes: resumes.length,
        avgAtsScore: avgAts,
        totalJdMatches: jdMatches.length,
        avgJdMatch:
          jdMatches.length > 0
            ? Math.round(jdMatches.reduce((s, a) => s + a.value, 0) / jdMatches.length)
            : 0,
      },
      atsTrend,
      skillDistribution,
      recentJdMatches: jdMatches,
    };
  },

  async getRecruiterAnalytics(recruiterId) {
    const jobs = await Job.find({ recruiter: recruiterId }).lean();
    const totalApplicants = jobs.reduce((s, j) => s + j.applicants.length, 0);
    const shortlisted = jobs.reduce(
      (s, j) => s + j.applicants.filter((a) => a.status === 'shortlisted').length,
      0
    );

    const applicantsByJob = jobs.map((j) => ({
      name: j.title,
      applicants: j.applicants.length,
      shortlisted: j.applicants.filter((a) => a.status === 'shortlisted').length,
    }));

    const statusDistribution = [
      { name: 'Applied', value: jobs.reduce((s, j) => s + j.applicants.filter((a) => a.status === 'applied').length, 0) },
      { name: 'Shortlisted', value: shortlisted },
      { name: 'Interview', value: jobs.reduce((s, j) => s + j.applicants.filter((a) => a.status === 'interview').length, 0) },
      { name: 'Rejected', value: jobs.reduce((s, j) => s + j.applicants.filter((a) => a.status === 'rejected').length, 0) },
    ];

    return {
      summary: {
        totalJobs: jobs.length,
        activeJobs: jobs.filter((j) => j.status === 'active').length,
        totalApplicants,
        shortlisted,
      },
      applicantsByJob,
      statusDistribution,
    };
  },

  async getAdminAnalytics() {
    const [users, resumes, jobs] = await Promise.all([
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Resume.countDocuments(),
      Job.countDocuments(),
    ]);

    return {
      usersByRole: users.map((u) => ({ role: u._id, count: u.count })),
      totalResumes: resumes,
      totalJobs: jobs,
    };
  },
};

export default analyticsService;
