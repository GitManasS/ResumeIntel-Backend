import Organization from '../models/Organization.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Resume from '../models/Resume.js';

export const platformAnalyticsService = {
  async getPlatformDashboard() {
    const organizations = await Organization.find({ isActive: true }).sort({ name: 1 }).lean();

    const organizationsSummary = await Promise.all(
      organizations.map(async (org) => {
        const orgId = org._id;
        const [staffByRole, applicationCount, jobCount, activeJobs, hiredCount] =
          await Promise.all([
            User.aggregate([
              { $match: { organization: orgId, orgRole: { $exists: true, $ne: null } } },
              { $group: { _id: '$orgRole', count: { $sum: 1 } } },
            ]),
            Application.countDocuments({ organization: orgId }),
            Job.countDocuments({ organization: orgId }),
            Job.countDocuments({ organization: orgId, status: 'active' }),
            Application.countDocuments({ organization: orgId, stage: 'hired' }),
          ]);

        return {
          id: orgId,
          name: org.name,
          slug: org.slug,
          industry: org.industry,
          staffByRole: staffByRole.map((r) => ({ role: r._id, count: r.count })),
          staffCount: staffByRole.reduce((s, r) => s + r.count, 0),
          applicationCount,
          jobCount,
          activeJobs,
          hiredCount,
        };
      })
    );

    const [totalUsers, totalCandidates, totalResumes, totalJobs, totalApplications] =
      await Promise.all([
        User.countDocuments({ orgRole: { $exists: true, $ne: null } }),
        User.countDocuments({ role: 'candidate' }),
        Resume.countDocuments(),
        Job.countDocuments(),
        Application.countDocuments(),
      ]);

    const usersByOrgRole = await User.aggregate([
      { $match: { orgRole: { $exists: true, $ne: null } } },
      { $group: { _id: '$orgRole', count: { $sum: 1 } } },
    ]);

    return {
      summary: {
        organizationCount: organizations.length,
        totalStaff: totalUsers,
        totalCandidates,
        totalResumes,
        totalJobs,
        totalApplications,
      },
      organizations: organizationsSummary,
      usersByOrgRole: usersByOrgRole.map((u) => ({ role: u._id, count: u.count })),
    };
  },
};

export default platformAnalyticsService;
