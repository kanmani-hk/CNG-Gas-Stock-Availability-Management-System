import { cngUserConn } from '../config/db.js';
import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      name: String, // Or ref if needed
    },
    stationName: {
        type: String,
        required: true,
    },
    slotTime: {
      type: String,
      required: true,
    },
    slotDate: {
      type: Date,
      required: true,
    },
    requestedGasInKg: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default cngUserConn.model('Booking', bookingSchema, 'bookings');
