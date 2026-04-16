import { bunkAdminConn } from '../config/db.js';
import mongoose from 'mongoose';

const driverRequestSchema = new mongoose.Schema(
  {
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      required: true,
    },
    driverName: {
      type: String,
      required: true,
    },
    driverEmail: String,
    vehicleNumber: {
      type: String,
      required: true,
    },
    timeSlot: {
        type: String,
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

export default bunkAdminConn.model('DriverRequest', driverRequestSchema, 'driver_requests');
