import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { ApiError } from '../utils/ApiError.js';
import { isValidStage } from '../config/pipeline.js';
import { activityService } from './activity.service.js';
import { auditService } from './audit.service.js';
import { eventBus, EVENTS } from '../events/eventBus.js';

export const pipelineService = {
  async getBoard(organizationId, jobId) {
    const query = { organization: organizationId };
    if (jobId) query.job = jobId;

    const applications = await Application.find(query)
      .populate('candidate', 'name email title')
      .populate('resume', 'fileName atsAnalysis parsedData.skills')
      .populate('job', 'title company')
      .populate('owner', 'name email')
      .sort('-updatedAt');

    const byStage = {};
    for (const app of applications) {
      if (!byStage[app.stage]) byStage[app.stage] = [];
      byStage[app.stage].push(app);
    }
    return { applications, byStage, total: applications.length };
  },

  async moveStage(applicationId, organizationId, userId, { toStage, note }, req) {
    if (!isValidStage(toStage)) throw ApiError.badRequest('Invalid pipeline stage');

    const application = await Application.findOne({
      _id: applicationId,
      organization: organizationId,
    });
    if (!application) throw ApiError.notFound('Application not found');

    const fromStage = application.stage;
    if (fromStage === toStage) return application;

    application.stageHistory.push({
      fromStage,
      toStage,
      movedBy: userId,
      note,
      movedAt: new Date(),
    });
    application.stage = toStage;
    if (toStage === 'rejected') application.rejectedAt = new Date();
    if (toStage === 'hired') application.hiredAt = new Date();
    await application.save();

    await activityService.record({
      organization: organizationId,
      user: userId,
      candidate: application.candidate,
      application: application._id,
      type: 'stage_changed',
      title: `Moved to ${toStage.replace(/_/g, ' ')}`,
      description: note,
      metadata: { fromStage, toStage },
    });

    await auditService.log({
      organization: organizationId,
      actor: userId,
      action: 'pipeline.move',
      resource: 'Application',
      resourceId: application._id,
      metadata: { fromStage, toStage },
      req,
    });

    eventBus.emit(EVENTS.APPLICATION_STAGE_CHANGED, {
      application,
      fromStage,
      toStage,
      organizationId,
    });

    if (toStage === 'shortlisted') {
      eventBus.emit(EVENTS.CANDIDATE_SHORTLISTED, { application, organizationId });
    }

    return application.populate([
      { path: 'candidate', select: 'name email' },
      { path: 'job', select: 'title company' },
    ]);
  },

  async assignOwner(applicationId, organizationId, ownerId) {
    const application = await Application.findOneAndUpdate(
      { _id: applicationId, organization: organizationId },
      { owner: ownerId },
      { new: true }
    );
    if (!application) throw ApiError.notFound('Application not found');
    return application;
  },

  async createFromJobApply({ job, candidate, resume, matchScore, source = 'career_portal' }) {
    const existing = await Application.findOne({
      job: job._id,
      candidate: candidate._id,
    });
    if (existing) throw ApiError.conflict('Already applied to this job');

    const application = await Application.create({
      organization: job.organization,
      job: job._id,
      candidate: candidate._id,
      resume: resume?._id,
      matchScore,
      stage: 'applied',
      source,
      stageHistory: [{ toStage: 'applied', movedAt: new Date() }],
    });

    eventBus.emit(EVENTS.APPLICATION_CREATED, { application, job });

    return application;
  },
};

export default pipelineService;
