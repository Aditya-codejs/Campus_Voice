import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    complaint_code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    is_anonymous: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      required: [true, 'Please provide complaint title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide complaint description'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please specify a category'],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Please specify a department'],
    },
    assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: [
        'submitted',
        'under_review',
        'assigned',
        'in_progress',
        'need_more_info',
        'escalated',
        'resolved',
        'closed',
        'reopened',
        'rejected',
      ],
      default: 'submitted',
      index: true,
    },
    location: {
      type: String,
      trim: true,
    },
    incident_date: {
      type: Date,
      default: Date.now,
    },
    rejection_reason: {
      type: String,
      trim: true,
    },
    resolution_summary: {
      type: String,
      trim: true,
    },
    resolution_proof: [
      {
        url: String,
        file_name: String,
        uploaded_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    feedback: {
      type: String,
      trim: true,
    },
    due_date: {
      type: Date,
      required: true,
    },
    is_overdue: {
      type: Boolean,
      default: false,
    },
    overdue_notified: {
      type: Boolean,
      default: false,
    },
    escalated_at: Date,
    resolved_at: Date,
    closed_at: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for attachments
complaintSchema.virtual('attachments', {
  ref: 'ComplaintAttachment',
  localField: '_id',
  foreignField: 'complaint',
});

// Virtual for timeline history
complaintSchema.virtual('status_history', {
  ref: 'ComplaintStatusHistory',
  localField: '_id',
  foreignField: 'complaint',
});

// Virtual for comments
complaintSchema.virtual('comments', {
  ref: 'ComplaintComment',
  localField: '_id',
  foreignField: 'complaint',
});

export const Complaint = mongoose.model('Complaint', complaintSchema);

