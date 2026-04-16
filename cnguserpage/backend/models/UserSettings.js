import { cngUserConn } from '../config/db.js';
import mongoose from 'mongoose';

const userSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    notifications: { type: Boolean, default: true },
    locationTracking: { type: Boolean, default: true },
    autoRefresh: { type: Boolean, default: true },
    darkMode: { type: Boolean, default: false },
    units: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
    language: { type: String, default: 'english' },
    stockAlerts: { type: Boolean, default: true },
    priceAlerts: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default cngUserConn.model('UserSettings', userSettingsSchema, 'user_settings');
