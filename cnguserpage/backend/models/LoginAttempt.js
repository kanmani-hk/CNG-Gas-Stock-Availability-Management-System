import { cngUserConn } from '../config/db.js';
import mongoose from 'mongoose';

const loginAttemptSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    success: {
      type: Boolean,
      required: true,
    },
    ip: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default cngUserConn.model('LoginAttempt', loginAttemptSchema, 'login_attempts');