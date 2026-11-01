import mongoose from 'mongoose';

const complaintStatusHistorySchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    old_status: {
      type: String,
    },
    new_status: {
      type: String,
      required: true,
    },
    changed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    changed_by_name: {
      type: String,
      default: 'System',
    },
    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ComplaintStatusHistory = mongoose.model(
  'ComplaintStatusHistory',
  complaintStatusHistorySchema
);

