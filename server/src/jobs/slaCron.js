import cron from 'node-cron';
import { Complaint } from '../models/Complaint.js';
import { ComplaintStatusHistory } from '../models/ComplaintStatusHistory.js';
import { User } from '../models/User.js';
import { createNotification } from '../services/notificationService.js';

export const initSlaCronJobs = () => {
  // Run every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    try {
      const now = new Date();

      // 1. Check for overdue complaints
      const overdueComplaints = await Complaint.find({
        status: { $nin: ['resolved', 'closed', 'rejected'] },
        due_date: { $lt: now },
        overdue_notified: { $ne: true },
      });

      if (overdueComplaints.length > 0) {
        console.log(`[SLA Cron] Found ${overdueComplaints.length} overdue complaint(s). Flagging & alerting...`);

        const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } });

        for (const complaint of overdueComplaints) {
          complaint.is_overdue = true;
          complaint.overdue_notified = true;
          // Optionally flag as escalated if critical
          if (complaint.priority === 'critical' && complaint.status !== 'escalated') {
            const oldStatus = complaint.status;
            complaint.status = 'escalated';
            complaint.escalated_at = now;

            await ComplaintStatusHistory.create({
              complaint: complaint._id,
              old_status: oldStatus,
              new_status: 'escalated',
              changed_by_name: 'System (SLA Monitor)',
              note: `Automated escalation: Target resolution SLA breached on ${now.toISOString()}`,
            });
          }

          await complaint.save();

          // Alert admins
          for (const admin of admins) {
            await createNotification({
              recipientId: admin._id,
              title: 'SLA Breach: Overdue Complaint',
              message: `Complaint [${complaint.complaint_code}] "${complaint.title}" has breached its SLA due date.`,
              type: 'escalation',
              complaintId: complaint._id,
            });
          }
        }
      }

      // 2. 7-Day Auto-Close for Resolved Complaints
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const toAutoClose = await Complaint.find({
        status: 'resolved',
        resolved_at: { $lt: sevenDaysAgo },
      });

      for (const complaint of toAutoClose) {
        complaint.status = 'closed';
        complaint.closed_at = now;
        await complaint.save();

        await ComplaintStatusHistory.create({
          complaint: complaint._id,
          old_status: 'resolved',
          new_status: 'closed',
          changed_by_name: 'System (Auto-Close)',
          note: 'Auto-closed after 7 days without student reopen or objection',
        });
      }
    } catch (error) {
      console.error('[SLA Cron Error]', error.message);
    }
  });

  console.log('[SLA Engine] SLA monitor and auto-close cron jobs initialized.');
};

