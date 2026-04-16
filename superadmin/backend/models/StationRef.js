import { bunkAdminConn } from '../config/db.js';
import mongoose from 'mongoose';

// Read-only mirror of bunkadmindb Station collection
const stationSchema = new mongoose.Schema(
    {
        name: String,
        address: String,
        lat: Number,
        lng: Number,
        stockLevel: Number,
        pricePerKg: Number,
        pumpStatus: { type: String, default: 'free' },
        waitingTime: { type: Number, default: 0 },
        operatingHours: String,
        lastUpdated: String,
        status: { type: String, default: 'pending' }, // pending | approved | rejected
        ownedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'BunkAdmin' },
        bookings: [
            {
                driverName: String,
                vehicleNumber: String,
                timeSlot: String,
                status: { type: String, default: 'pending' },
                createdAt: { type: Date, default: Date.now },
            },
        ],
        dailySales: [
            {
                date: String,
                amount: Number,
                stockSold: Number,
                createdAt: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

export default bunkAdminConn.models.Station || bunkAdminConn.model('Station', stationSchema, 'stations');

