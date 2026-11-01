import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'staff', 'admin', 'superadmin'],
      default: 'student',
    },
    // Registration approval status for staff
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: function () {
        return this.role === 'staff' ? 'pending' : 'approved';
      },
    },
    // Student specific fields
    enrollment_number: {
      type: String,
      trim: true,
      sparse: true,
    },
    course: {
      type: String,
      trim: true,
    },
    academic_year: {
      type: String,
      trim: true,
    },
    // Staff specific fields
    employee_id: {
      type: String,
      trim: true,
      sparse: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    department_name: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email_verified: {
      type: Boolean,
      default: true, // simplified or toggleable via verification email
    },
    verification_token: String,
    reset_password_token: String,
    reset_password_expire: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT Token
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
      status: this.status,
      email: this.email,
    },
    process.env.JWT_SECRET || 'university_jwt_fallback_key',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

export const User = mongoose.model('User', userSchema);

