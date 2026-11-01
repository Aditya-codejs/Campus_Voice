import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    user_email: {
      type: String,
      default: 'System',
    },
    user_role: {
      type: String,
      default: 'System',
    },
    action: {
      type: String,
      required: true,
    },
    entity_type: {
      type: String,
      required: true,
    },
    entity_id: {
      type: String,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
    ip_address: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);

