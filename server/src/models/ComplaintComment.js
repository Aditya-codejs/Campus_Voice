import mongoose from 'mongoose';

const complaintCommentSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    user_name: {
      type: String,
      required: true,
    },
    user_role: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Please provide comment text'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    is_internal: {
      type: Boolean,
      default: false, // Staff-only note if true; never sent to student
    },
  },
  {
    timestamps: true,
  }
);

export const ComplaintComment = mongoose.model('ComplaintComment', complaintCommentSchema);

