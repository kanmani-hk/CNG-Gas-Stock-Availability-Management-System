import { cngUserConn } from '../config/db.js';
import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['Sedan', 'SUV', 'Hatchback', 'CNG Car', 'Auto-Rickshaw', 'Truck', 'Van', 'Other'],
      required: true,
    },
    number: {
      type: String,
      required: true,
      unique: true,
    },
    isPrimary: {
        type: Boolean,
        default: true
    }
  },
  { timestamps: true }
);

export default cngUserConn.model('Vehicle', vehicleSchema, 'user_vehicles');
