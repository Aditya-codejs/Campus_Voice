import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide category name'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    default_department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    default_priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    is_sensitive: {
      type: Boolean,
      default: false, // If sensitive, direct escalation & restricted visibility
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Category = mongoose.model('Category', categorySchema);

