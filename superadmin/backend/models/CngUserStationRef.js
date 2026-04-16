import { cngUserConn } from '../config/db.js';
import mongoose from 'mongoose';

// Read-only mirror of cnguserdb Station collection
const stationSchema = new mongoose.Schema(
    {
        name: String,
        address: String,
        lat: Number,
        lng: Number,
        stockLevel: Number,
        pricePerKg: Number,
        operatingHours: String,
        lastUpdated: String,
    },
    { timestamps: true }
);

export default cngUserConn.models.Station || cngUserConn.model('Station', stationSchema);
