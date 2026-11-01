import mongoose from 'mongoose';

const complaintAttachmentSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    uploaded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    file_url: {
      type: String,
      required: true,
    },
    file_name: {
      type: String,
      required: true,
    },
    file_type: {
      type: String,
    },
    file_size: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

export const ComplaintAttachment = mongoose.model(
  'ComplaintAttachment',
  complaintAttachmentSchema
);

