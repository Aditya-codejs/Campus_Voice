import { Complaint } from '../models/Complaint.js';

export const generateComplaintCode = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `SCT-${currentYear}-`;

  // Find the highest existing code for the current year
  const lastComplaint = await Complaint.findOne({
    complaint_code: new RegExp(`^${prefix}`)
  })
    .sort({ createdAt: -1 })
    .select('complaint_code');

  let nextNumber = 1;
  if (lastComplaint && lastComplaint.complaint_code) {
    const parts = lastComplaint.complaint_code.split('-');
    if (parts.length === 3) {
      const parsed = parseInt(parts[2], 10);
      if (!isNaN(parsed)) {
        nextNumber = parsed + 1;
      }
    }
  }

  // Pad to 6 digits, e.g. 000001
  const paddedNumber = String(nextNumber).padStart(6, '0');
  return `${prefix}${paddedNumber}`;
};

