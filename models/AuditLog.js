const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema(
  {
    actorType: { type: String, enum: ['Admin', 'Vendor', 'Customer', 'System'], required: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, refPath: 'actorTypeRef' },
    actorTypeRef: { type: String, default: 'Admin' },

    action: { type: String, required: true }, // e.g., 'VENDOR_APPROVED', 'VENDOR_REJECTED'
    entityType: { type: String, required: true }, // e.g., 'Vendor', 'Customer'
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'entityType' },

    reason: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

AuditLogSchema.index({ entityType: 1, entityId: 1, action: 1, createdAt: -1 });
AuditLogSchema.index({ actorType: 1, actorId: 1, createdAt: -1 });

module.exports = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
