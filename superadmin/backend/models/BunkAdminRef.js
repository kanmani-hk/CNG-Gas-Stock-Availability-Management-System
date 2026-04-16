import { bunkAdminConn } from '../config/db.js';
import mongoose from 'mongoose';

// Read-only mirror of bunkadmindb BunkAdmin collection
const bunkAdminSchema = new mongoose.Schema(
    {
        name: String,
        email: String,
        phone: String,
        role: String,
        status: { type: String, default: 'pending' }, // pending | approved | rejected
        assignedStation: { type: mongoose.Schema.Types.ObjectId, ref: 'Station' },
    },
    { timestamps: true }
);

export default bunkAdminConn.model('BunkAdmin', bunkAdminSchema);
