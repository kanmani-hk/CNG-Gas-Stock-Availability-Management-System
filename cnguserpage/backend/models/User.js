import { cngUserConn } from '../config/db.js';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: 'Coimbatore, Tamil Nadu',
    },
    vehicle: {
      name: { type: String, default: '' },
      type: { type: String, default: '' },
      number: { type: String, default: '' },
    },
    settings: {
      notifications: { type: Boolean, default: true },
      darkMode: { type: Boolean, default: false },
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default cngUserConn.model('User', userSchema, 'users');
