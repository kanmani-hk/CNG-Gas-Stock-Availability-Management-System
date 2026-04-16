import mongoose from 'mongoose';
import { superAdminConn } from '../config/db.js';

const globalPriceSchema = new mongoose.Schema({
    pricePerKg: {
        type: Number,
        required: true,
        default: 85.0
    },
    updatedBy: {
        type: String,
        default: 'Super Admin'
    }
}, { timestamps: true });

export default superAdminConn.model('GlobalPrice', globalPriceSchema);
