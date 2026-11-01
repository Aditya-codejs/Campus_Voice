import { AuditLog } from '../models/AuditLog.js';

export const logActivity = async ({
  user = null,
  action,
  entity_type,
  entity_id = null,
  details = null,
  ip_address = null,
}) => {
  try {
    await AuditLog.create({
      user: user?._id || user?.id || null,
      user_email: user?.email || 'System',
      user_role: user?.role || 'System',
      action,
      entity_type,
      entity_id: entity_id ? String(entity_id) : null,
      details,
      ip_address,
    });
  } catch (error) {
    console.error('[Audit Log Error]', error.message);
  }
};
