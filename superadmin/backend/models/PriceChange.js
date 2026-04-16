import { superAdminConn } from '../config/db.js';
import mongoose from 'mongoose';

const priceChangeSchema = new mongoose.Schema(
  {
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station', // Reference to Station model in BunkAdmin DB
    },
    stationName: {
      type: String,
      required: true,
    },
    oldPrice: {
      type: Number,
      required: true,
    },
    newPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'applied', 'rejected'],
      default: 'pending',
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SuperAdmin',
    },
  },
  { timestamps: true }
);

export default superAdminConn.model('PriceChange', priceChangeSchema, 'price_changes');
