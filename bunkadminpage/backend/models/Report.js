import mongoose from 'mongoose';
import { bunkAdminConn } from '../config/db.js';

const reportSchema = new mongoose.Schema(
  {
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      required: true,
    },
    date: {
      type: String, // e.g., '2026-03-25'
      required: true,
    },
    totalSalesAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    totalStockSold: {
      type: Number,
      required: true,
      default: 0,
    },
    totalBookings: {
        type: Number,
        default: 0
    },
    notes: String,
  },
  { timestamps: true }
);

// Compound index to ensure one report per station per day
reportSchema.index({ stationId: 1, date: 1 }, { unique: true });

export default bunkAdminConn.model('Report', reportSchema, 'reports');
