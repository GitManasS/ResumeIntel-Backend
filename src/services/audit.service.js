import AuditLog from '../models/AuditLog.js';

export const auditService = {
  async log({ organization, actor, action, resource, resourceId, metadata, req }) {
    return AuditLog.create({
      organization,
      actor,
      action,
      resource,
      resourceId,
      metadata,
      ip: req?.ip,
      userAgent: req?.get?.('user-agent'),
    });
  },

  async list(organizationId, { page = 1, limit = 20 }) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      AuditLog.find({ organization: organizationId })
        .populate('actor', 'name email orgRole')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments({ organization: organizationId }),
    ]);
    return { logs, total, page, limit };
  },
};

export default auditService;
