import Interview from '../models/Interview.js';
import Application from '../models/Application.js';
import { ApiError } from '../utils/ApiError.js';
import { activityService } from './activity.service.js';
import { eventBus, EVENTS } from '../events/eventBus.js';
import notificationService from './notification.service.js';

export const interviewScheduleService = {
  async schedule(organizationId, userId, data) {
    const application = await Application.findOne({
      _id: data.applicationId,
      organization: organizationId,
    });
    if (!application) throw ApiError.notFound('Application not found');

    const interview = await Interview.create({
      organization: organizationId,
      application: application._id,
      job: application.job,
      candidate: application.candidate,
      scheduledBy: userId,
      interviewers: data.interviewers || [userId],
      type: data.type || 'video',
      title: data.title,
      scheduledAt: data.scheduledAt,
      durationMinutes: data.durationMinutes || 60,
      timezone: data.timezone || 'UTC',
      meetingLink: data.meetingLink,
      location: data.location,
    });

    await activityService.record({
      organization: organizationId,
      user: userId,
      candidate: application.candidate,
      application: application._id,
      type: 'interview_scheduled',
      title: data.title,
      metadata: { interviewId: interview._id, scheduledAt: data.scheduledAt },
    });

    await notificationService.create({
      user: application.candidate,
      type: 'interview_reminder',
      title: 'Interview scheduled',
      message: `${data.title} on ${new Date(data.scheduledAt).toLocaleString()}`,
      link: '/candidate',
      metadata: { interviewId: interview._id },
    });

    eventBus.emit(EVENTS.INTERVIEW_SCHEDULED, { interview, organizationId });

    return interview.populate([
      { path: 'candidate', select: 'name email' },
      { path: 'interviewers', select: 'name email' },
      { path: 'job', select: 'title' },
    ]);
  },

  async list(organizationId, { from, to, status }) {
    const query = { organization: organizationId };
    if (status) query.status = status;
    if (from || to) {
      query.scheduledAt = {};
      if (from) query.scheduledAt.$gte = new Date(from);
      if (to) query.scheduledAt.$lte = new Date(to);
    }
    return Interview.find(query)
      .populate('candidate', 'name email')
      .populate('job', 'title company')
      .populate('interviewers', 'name email')
      .sort('scheduledAt');
  },

  async updateStatus(interviewId, organizationId, status) {
    const interview = await Interview.findOneAndUpdate(
      { _id: interviewId, organization: organizationId },
      { status },
      { new: true }
    );
    if (!interview) throw ApiError.notFound('Interview not found');
    return interview;
  },
};

export default interviewScheduleService;
