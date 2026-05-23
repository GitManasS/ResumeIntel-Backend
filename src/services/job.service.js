import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Resume from '../models/Resume.js';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import { buildCandidateApplicationStatus } from '../config/candidateApplicationStatus.js';
import { ApiError } from '../utils/ApiError.js';
import { aiService } from '../ai/ai.service.js';
import { getPagination } from '../utils/pagination.js';
import { pipelineService } from './pipeline.service.js';
import { activityService } from './activity.service.js';

export const jobService = {
  async create(recruiterId, organizationId, data) {
    const recruiter = await User.findById(recruiterId);
    const orgId = organizationId || recruiter?.organization;
    if (!orgId) {
      throw ApiError.badRequest('Organization context required to post jobs');
    }

    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Fallback company name from org when not provided
    let companyName = data.company || recruiter?.company;
    if (!companyName) {
      const Organization = (await import('../models/Organization.js')).default;
      const orgDoc = await Organization.findById(orgId).select('name');
      companyName = orgDoc?.name || 'Company';
    }

    return Job.create({
      ...data,
      status: data.status || 'active',
      employmentType: data.employmentType || 'full-time',
      recruiter: recruiterId,
      organization: orgId,
      slug: `${slug}-${Date.now().toString(36)}`,
      company: companyName,
    });
  },

  async update(jobId, recruiterId, data) {
    const job = await Job.findOneAndUpdate(
      { _id: jobId, recruiter: recruiterId },
      data,
      { new: true, runValidators: true }
    );
    if (!job) throw ApiError.notFound('Job not found');
    return job;
  },

  async delete(jobId, recruiterId) {
    const job = await Job.findOneAndDelete({ _id: jobId, recruiter: recruiterId });
    if (!job) throw ApiError.notFound('Job not found');
    return job;
  },

  async getRecruiterJobs(recruiterId, pagination, organizationId) {
    const { page, limit, skip, sort } = pagination;

    let query;
    if (organizationId) {
      // Backfill jobs saved without organization (legacy / super-admin edge cases)
      const orgRecruiters = await User.find({ organization: organizationId }).distinct('_id');
      const recruiterIds = orgRecruiters.length ? orgRecruiters : [recruiterId];
      await Job.updateMany(
        {
          recruiter: { $in: recruiterIds },
          $or: [{ organization: { $exists: false } }, { organization: null }],
        },
        { $set: { organization: organizationId } }
      );
      query = { organization: organizationId };
    } else {
      query = { recruiter: recruiterId };
    }

    const [jobs, total] = await Promise.all([
      Job.find(query).sort(sort).skip(skip).limit(limit),
      Job.countDocuments(query),
    ]);
    return { jobs, total, page, limit };
  },

  async getActiveJobs(pagination, filters = {}) {
    const { page, limit, skip, sort } = pagination;
    const query = { status: 'active', ...filters };
    if (filters.search) {
      query.$text = { $search: filters.search };
    }
    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('organization', 'name slug branding')
        .populate('recruiter', 'name company')
        .select('-applicants')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Job.countDocuments(query),
    ]);
    return { jobs, total, page, limit };
  },

  async getById(jobId) {
    const job = await Job.findById(jobId)
      .populate('organization', 'name slug branding')
      .populate('recruiter', 'name email company');
    if (!job) throw ApiError.notFound('Job not found');
    return job;
  },

  async getCandidateApplications(candidateId) {
    const applications = await Application.find({ candidate: candidateId })
      .populate({
        path: 'job',
        select: 'title company organization status',
        populate: { path: 'organization', select: 'name slug' },
      })
      .sort('-updatedAt')
      .lean();

    return applications.map((app) => {
      const jobId = app.job?._id || app.job;
      return {
        ...buildCandidateApplicationStatus(app),
        jobId,
        job: app.job
          ? {
              _id: app.job._id,
              title: app.job.title,
              company: app.job.company,
              organization: app.job.organization,
            }
          : undefined,
      };
    });
  },

  async attachApplicationStatusToJobs(jobs, candidateId) {
    if (!candidateId || !jobs?.length) return jobs;

    const jobIds = jobs.map((j) => j._id);
    const applications = await Application.find({
      candidate: candidateId,
      job: { $in: jobIds },
    })
      .select('job stage matchScore createdAt updatedAt')
      .lean();

    const byJob = Object.fromEntries(
      applications.map((app) => [app.job.toString(), buildCandidateApplicationStatus(app)])
    );

    return jobs.map((job) => {
      const doc = job.toObject ? job.toObject() : { ...job };
      const application = byJob[doc._id.toString()];
      if (application) {
        return { ...doc, hasApplied: true, application };
      }
      return { ...doc, hasApplied: false };
    });
  },

  async formatJobForCandidate(job, candidateId) {
    const data = job.toObject ? job.toObject() : { ...job };
    delete data.applicants;

    const application = await Application.findOne({
      job: job._id,
      candidate: candidateId,
    })
      .select('stage matchScore createdAt updatedAt')
      .lean();

    if (application) {
      return {
        ...data,
        hasApplied: true,
        application: buildCandidateApplicationStatus(application),
      };
    }

    const hasAppliedLegacy = (job.applicants || []).some(
      (a) => a.candidate?.toString() === candidateId?.toString()
    );
    return { ...data, hasApplied: hasAppliedLegacy };
  },

  async apply(jobId, candidateId, resumeId) {
    const job = await Job.findById(jobId);
    if (!job || job.status !== 'active') throw ApiError.notFound('Job not available');

    const resume = await Resume.findOne({ _id: resumeId, user: candidateId, status: 'ready' });
    if (!resume) throw ApiError.badRequest('Valid resume required');

    const existing = job.applicants.find((a) => a.candidate.toString() === candidateId);
    if (existing) throw ApiError.conflict('Already applied');

    const skills = resume.parsedData?.skills || [];
    const match = await aiService.matchJobDescription(skills, job.description, job.title);

    job.applicants.push({
      candidate: candidateId,
      resume: resumeId,
      matchScore: match.matchPercentage,
      status: 'applied',
    });
    await job.save();

    if (job.organization) {
      const candidate = await User.findById(candidateId);
      await pipelineService.createFromJobApply({
        job,
        candidate,
        resume,
        matchScore: match.matchPercentage,
        source: 'career_portal',
      });
      await activityService.record({
        organization: job.organization,
        user: candidateId,
        candidate: candidateId,
        type: 'application_submitted',
        title: `Applied to ${job.title}`,
        metadata: { jobId: job._id, matchScore: match.matchPercentage },
      });
    }

    return job;
  },

  async shortlist(jobId, recruiterId, candidateId) {
    const job = await Job.findOne({ _id: jobId, recruiter: recruiterId });
    if (!job) throw ApiError.notFound('Job not found');

    const applicant = job.applicants.find((a) => a.candidate.toString() === candidateId);
    if (!applicant) throw ApiError.notFound('Applicant not found');

    applicant.status = 'shortlisted';
    await job.save();
    return job;
  },

  async rankCandidates(jobId, recruiterId) {
    const job = await Job.findOne({ _id: jobId, recruiter: recruiterId }).populate(
      'applicants.candidate',
      'name email'
    );
    if (!job) throw ApiError.notFound('Job not found');

    const candidates = await Promise.all(
      job.applicants.map(async (a) => {
        const resume = await Resume.findById(a.resume);
        return {
          id: a.candidate._id.toString(),
          name: a.candidate.name,
          skills: resume?.parsedData?.skills || [],
          matchScore: a.matchScore,
        };
      })
    );

    const rankings = await aiService.rankCandidates(candidates, job.description);
    return rankings.sort((a, b) => b.score - a.score);
  },

  async searchCandidates(recruiterId, { skills, minScore, search }) {
    const jobs = await Job.find({ recruiter: recruiterId });
    const candidateIds = new Set();
    const results = [];

    for (const job of jobs) {
      for (const app of job.applicants) {
        const cid = app.candidate.toString();
        if (candidateIds.has(cid)) continue;
        candidateIds.add(cid);

        const resume = await Resume.findById(app.resume);
        const candidateSkills = resume?.parsedData?.skills || [];

        if (skills?.length && !skills.some((s) => candidateSkills.includes(s))) continue;
        if (minScore && app.matchScore < minScore) continue;

        const user = await User.findById(cid).select('name email');
        if (search && !user.name.toLowerCase().includes(search.toLowerCase())) continue;

        results.push({
          candidate: user,
          resume,
          matchScore: app.matchScore,
          jobTitle: job.title,
          status: app.status,
        });
      }
    }

    return results.sort((a, b) => b.matchScore - a.matchScore);
  },
};

export default jobService;
