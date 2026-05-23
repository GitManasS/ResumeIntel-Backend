import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true, index: true },
    resource: { type: String, required: true },
    resourceId: mongoose.Schema.Types.ObjectId,
    metadata: mongoose.Schema.Types.Mixed,
    ip: String,
    userAgent: String,
  },
  { timestamps: true }
);

auditLogSchema.index({ organization: 1, createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
