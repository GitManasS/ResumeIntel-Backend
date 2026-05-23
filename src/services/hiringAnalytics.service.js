import Application from '../models/Application.js';
import Job from '../models/Job.js';
import Interview from '../models/Interview.js';
import { PIPELINE_STAGES } from '../config/pipeline.js';

export const hiringAnalyticsService = {
  async getOrgDashboard(organizationId) {
    const [applications, jobs, interviews] = await Promise.all([
      Application.find({ organization: organizationId }).lean(),
      Job.find({ organization: organizationId }).lean(),
      Interview.find({ organization: organizationId }).lean(),
    ]);

    const funnel = PIPELINE_STAGES.filter((s) => s.id !== 'rejected').map((stage) => ({
      stage: stage.label,
      stageId: stage.id,
      count: applications.filter((a) => a.stage === stage.id).length,
    }));

    const rejected = applications.filter((a) => a.stage === 'rejected').length;
    const hired = applications.filter((a) => a.stage === 'hired').length;
    const total = applications.length;

    const conversionRate = total ? Math.round((hired / total) * 100) : 0;

    const jobsPerformance = await Promise.all(
      jobs.slice(0, 10).map(async (job) => {
        const jobApps = applications.filter((a) => a.job.toString() === job._id.toString());
        return {
          jobId: job._id,
          title: job.title,
          applicants: jobApps.length,
          hired: jobApps.filter((a) => a.stage === 'hired').length,
          avgMatch:
            jobApps.length > 0
              ? Math.round(jobApps.reduce((s, a) => s + (a.matchScore || 0), 0) / jobApps.length)
              : 0,
        };
      })
    );

    const sourceBreakdown = applications.reduce((acc, a) => {
      const src = a.source || 'other';
      acc[src] = (acc[src] || 0) + 1;
      return acc;
    }, {});

    const sourceAnalytics = Object.entries(sourceBreakdown).map(([name, value]) => ({
      name,
      value,
    }));

    const completedInterviews = interviews.filter((i) => i.status === 'completed').length;
    const interviewSuccessRate =
      interviews.length > 0 ? Math.round((completedInterviews / interviews.length) * 100) : 0;

    const avgTimeToHire = hired
      ? Math.round(
          applications
            .filter((a) => a.hiredAt)
            .reduce((s, a) => s + (new Date(a.hiredAt) - new Date(a.createdAt)) / 86400000, 0) /
            Math.max(hired, 1)
        )
      : 0;

    return {
      summary: {
        totalApplications: total,
        activeJobs: jobs.filter((j) => j.status === 'active').length,
        hired,
        rejected,
        conversionRate,
        scheduledInterviews: interviews.filter((i) => i.status === 'scheduled').length,
        interviewSuccessRate,
        avgTimeToHireDays: avgTimeToHire,
      },
      funnel,
      jobsPerformance,
      sourceAnalytics,
      pipelineDistribution: PIPELINE_STAGES.map((s) => ({
        name: s.label,
        value: applications.filter((a) => a.stage === s.id).length,
      })),
    };
  },
};

export default hiringAnalyticsService;
