import Organization from '../models/Organization.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

export const careerPortalService = {
  async getOrganizationBySlug(slug) {
    const org = await Organization.findOne({ slug, isActive: true, 'settings.careerPortalEnabled': true });
    if (!org) throw ApiError.notFound('Career portal not found');
    return org;
  },

  async getPublicJobs(slug, { page = 1, limit = 20 }) {
    const org = await this.getOrganizationBySlug(slug);
    const orgRecruiters = await User.find({ organization: org._id }).distinct('_id');
    if (orgRecruiters.length) {
      await Job.updateMany(
        {
          recruiter: { $in: orgRecruiters },
          $or: [{ organization: { $exists: false } }, { organization: null }],
        },
        { $set: { organization: org._id } }
      );
    }
    const skip = (page - 1) * limit;
    const query = { organization: org._id, status: 'active' };

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .select('title slug company location employmentType description skills salary createdAt')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Job.countDocuments(query),
    ]);

    return { organization: org, jobs, total, page, limit };
  },

  async getPublicJob(slug, jobId) {
    const org = await this.getOrganizationBySlug(slug);
    const job = await Job.findOne({
      _id: jobId,
      organization: org._id,
      status: 'active',
    }).select('-applicants');
    if (!job) throw ApiError.notFound('Job not found');
    return { organization: org, job };
  },
};

export default careerPortalService;
