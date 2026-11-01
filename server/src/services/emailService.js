import { getTransporter } from '../config/mailer.js';

const emailWrapper = (title, bodyHtml) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #0c3d6f; padding: 28px 32px; text-align: left; }
    .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.025em; }
    .header p { color: #93c5fd; margin: 6px 0 0 0; font-size: 13px; }
    .content { padding: 32px; }
    .btn { display: inline-block; background-color: #026bc9; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 20px 0; }
    .footer { background: #f1f5f9; padding: 20px 32px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; background: #e0f2fe; color: #0369a1; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>CampusVoice University Portal</h1>
      <p>Official Grievance Redressal & Complaint Tracker</p>
    </div>
    <div class="content">
      <h2 style="margin-top:0; color:#0f172a; font-size: 18px;">${title}</h2>
      ${bodyHtml}
    </div>
    <div class="footer">
      <p>This is an automated notification from the Campus Grievance Redressal Cell.</p>
      <p>&copy; ${new Date().getFullYear()} University Administration. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = getTransporter();
  const from = process.env.EMAIL_FROM || 'CampusVoice Grievance Cell <no-reply@college.edu>';

  if (!transporter) {
    console.log(`\n================== [EMAIL SIMULATION] ==================`);
    console.log(`To: ${to}`);
    console.log(`From: ${from}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content:\n${text || 'HTML Content Rendered'}`);
    console.log(`========================================================\n`);
    return { simulated: true, success: true };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: text || '',
      html,
    });
    console.log(`[Email Sent] Message ID: ${info.messageId} to ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Error] Failed sending to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

// 1. Welcome Email
export const sendWelcomeEmail = async (user) => {
  const isStaff = user.role === 'staff';
  const title = `Welcome to CampusVoice, ${user.name}!`;
  const body = `
    <p>Your account has been registered successfully with role: <strong>${user.role.toUpperCase()}</strong>.</p>
    ${
      isStaff
        ? `<div style="background:#fef3c7; border: 1px solid #fde68a; padding:16px; border-radius:8px; margin:16px 0;">
            <strong style="color:#92400e;">Staff Approval Pending</strong>
            <p style="margin:4px 0 0; color:#b45309; font-size:13px;">Your staff account is currently under administrator review. You will receive an email as soon as an administrator approves your account.</p>
           </div>`
        : `<p>You can now log in, submit complaints, upload proof, and track their resolution in real time.</p>`
    }
    <p>If you have any questions or did not register for this service, please contact the institution helpdesk.</p>
  `;

  return await sendEmail({
    to: user.email,
    subject: `Welcome to CampusVoice - Registration Confirmation`,
    html: emailWrapper(title, body),
    text: `Welcome to CampusVoice, ${user.name}! Your account role is ${user.role}.`,
  });
};

// 2. Staff Approval/Rejection Email
export const sendStaffStatusEmail = async (staffUser, status, reason = '') => {
  const approved = status === 'approved';
  const title = approved ? 'Staff Account Approved' : 'Staff Account Registration Update';
  const body = approved
    ? `
      <p>Dear ${staffUser.name},</p>
      <p>Your staff account for department <strong>${staffUser.department_name || 'Assigned Department'}</strong> has been <strong>approved</strong> by the administrator.</p>
      <p>You can now sign in to your staff dashboard to view, acknowledge, and resolve assigned grievances.</p>
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" class="btn">Sign In to Staff Dashboard</a>
    `
    : `
      <p>Dear ${staffUser.name},</p>
      <p>Your staff account registration could not be approved at this time.</p>
      ${reason ? `<p><strong>Reason provided:</strong> ${reason}</p>` : ''}
      <p>Please contact the system administrator or your department head for assistance.</p>
    `;

  return await sendEmail({
    to: staffUser.email,
    subject: approved ? 'CampusVoice - Staff Account Approved' : 'CampusVoice - Registration Update',
    html: emailWrapper(title, body),
    text: approved ? 'Your staff account has been approved.' : 'Your staff account registration was rejected.',
  });
};

// 3. Complaint Submission Confirmation Email
export const sendComplaintCreatedEmail = async (studentEmail, studentName, complaint) => {
  const title = 'Complaint Successfully Submitted';
  const trackingUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/track/${complaint.complaint_code}`;

  const body = `
    <p>Dear ${studentName},</p>
    <p>Your complaint has been logged into the university system.</p>
    <div style="background:#f1f5f9; padding:16px; border-radius:8px; margin:16px 0;">
      <p style="margin:0 0 8px;"><strong>Complaint Tracking ID:</strong> <span class="badge">${complaint.complaint_code}</span></p>
      <p style="margin:0 0 8px;"><strong>Title:</strong> ${complaint.title}</p>
      <p style="margin:0 0 8px;"><strong>Priority:</strong> <span style="text-transform:capitalize;">${complaint.priority}</span></p>
      <p style="margin:0;"><strong>Expected Target Resolution:</strong> ${new Date(complaint.due_date).toLocaleString()}</p>
    </div>
    <p>You can track the progress of your grievance at any time:</p>
    <a href="${trackingUrl}" class="btn">Track Complaint Status</a>
  `;

  return await sendEmail({
    to: studentEmail,
    subject: `Complaint Submitted [${complaint.complaint_code}]: ${complaint.title}`,
    html: emailWrapper(title, body),
    text: `Your complaint ${complaint.complaint_code} has been submitted. Track status at: ${trackingUrl}`,
  });
};

// 4. Complaint Assignment Email
export const sendComplaintAssignedEmail = async (staffEmail, staffName, complaint) => {
  const title = 'New Complaint Assigned to You';
  const complaintUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/staff/complaints/${complaint._id}`;

  const body = `
    <p>Dear ${staffName},</p>
    <p>A new student grievance has been assigned to you for investigation and resolution.</p>
    <div style="background:#f1f5f9; padding:16px; border-radius:8px; margin:16px 0;">
      <p style="margin:0 0 8px;"><strong>Tracking ID:</strong> <span class="badge">${complaint.complaint_code}</span></p>
      <p style="margin:0 0 8px;"><strong>Title:</strong> ${complaint.title}</p>
      <p style="margin:0 0 8px;"><strong>Priority:</strong> <span style="text-transform:capitalize;">${complaint.priority}</span></p>
      <p style="margin:0;"><strong>Resolution Due Date:</strong> ${new Date(complaint.due_date).toLocaleString()}</p>
    </div>
    <a href="${complaintUrl}" class="btn">Review Complaint in Staff Portal</a>
  `;

  return await sendEmail({
    to: staffEmail,
    subject: `Assigned: Complaint [${complaint.complaint_code}] - ${complaint.title}`,
    html: emailWrapper(title, body),
    text: `Complaint ${complaint.complaint_code} has been assigned to you. Review it at: ${complaintUrl}`,
  });
};

// 5. Complaint Status Update Email
export const sendComplaintStatusEmail = async (studentEmail, studentName, complaint, note = '') => {
  const title = `Status Update on Complaint ${complaint.complaint_code}`;
  const trackingUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/track/${complaint.complaint_code}`;

  const body = `
    <p>Dear ${studentName},</p>
    <p>The status of your complaint has been updated to: <strong style="text-transform:capitalize; color:#026bc9;">${complaint.status.replace('_', ' ')}</strong>.</p>
    ${note ? `<blockquote style="border-left: 4px solid #026bc9; margin: 16px 0; padding: 8px 16px; background:#f8fafc; color:#475569;">"${note}"</blockquote>` : ''}
    ${
      complaint.status === 'resolved'
        ? `<div style="background:#ecfdf5; border: 1px solid #a7f3d0; padding:16px; border-radius:8px; margin:16px 0;">
            <strong style="color:#065f46;">Issue Marked as Resolved</strong>
            <p style="margin:4px 0 0; color:#047857; font-size:13px;">Please inspect the resolution. You may rate the resolution or reopen the issue within 7 days if unsatisfied.</p>
           </div>`
        : ''
    }
    <a href="${trackingUrl}" class="btn">View Timeline & Update</a>
  `;

  return await sendEmail({
    to: studentEmail,
    subject: `Update on [${complaint.complaint_code}]: Status changed to ${complaint.status.replace('_', ' ')}`,
    html: emailWrapper(title, body),
    text: `Your complaint ${complaint.complaint_code} is now ${complaint.status}. Note: ${note}`,
  });
};

// 6. Password Reset Email
export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
  const title = 'Password Reset Request';

  const body = `
    <p>Hello ${user.name},</p>
    <p>We received a request to reset your password for your CampusVoice account.</p>
    <p>Click the button below to choose a new password. This link is valid for 1 hour.</p>
    <a href="${resetUrl}" class="btn">Reset My Password</a>
    <p style="font-size:12px; color:#64748b; margin-top:16px;">If you did not request this password reset, please ignore this email.</p>
  `;

  return await sendEmail({
    to: user.email,
    subject: `CampusVoice - Password Reset Request`,
    html: emailWrapper(title, body),
    text: `Reset your password here: ${resetUrl}`,
  });
};

