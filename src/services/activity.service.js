import Activity from '../models/Activity.js';

export const activityService = {
  async record({ organization, user, candidate, application, type, title, description, metadata }) {
    return Activity.create({
      organization,
      user,
      candidate,
      application,
      type,
      title,
      description,
      metadata,
    });
  },

  async getByApplication(applicationId, limit = 50) {
    return Activity.find({ application: applicationId })
      .populate('user', 'name email orgRole')
      .sort('-createdAt')
      .limit(limit);
  },

  async getByCandidate(candidateId, limit = 50) {
    return Activity.find({ candidate: candidateId })
      .populate('user', 'name email')
      .sort('-createdAt')
      .limit(limit);
  },

  async getByOrganization(organizationId, { page = 1, limit = 30 }) {
    const skip = (page - 1) * limit;
    return Activity.find({ organization: organizationId })
      .populate('user candidate', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);
  },
};

export default activityService;
