import { bunkAdminConn } from '../config/db.js';
import mongoose from 'mongoose';

const stationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    stockLevel: {
      type: Number,
      default: 500,
      min: 0,
      max: 1000,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    pricePerKg: {
      type: Number,
      required: true,
    },
    operatingHours: {
      type: String,
      default: '24/7',
    },
    lastUpdated: {
      type: String,
      default: 'Just now',
    },
    pumpStatus: {
        type: String,
        enum: ['free', 'busy', 'maintenance'],
        default: 'free'
    },
    waitingTime: {
        type: Number,
        default: 0
    },
    ownedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BunkAdmin',
      default: null,
    },
    bookings: [
        {
            driverName: String,
            driverEmail: String,
            vehicleNumber: String,
            timeSlot: String,
            requestedGas: Number,
            status: { type: String, default: 'pending' },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    dailySales: [
        {
            date: String,
            amount: Number,
            stockSold: Number,
            createdAt: { type: Date, default: Date.now }
        }
    ]
  },
  { timestamps: true }
);

export default bunkAdminConn.models.Station || bunkAdminConn.model('Station', stationSchema, 'stations');




