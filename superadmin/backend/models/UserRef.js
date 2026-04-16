import { cngUserConn } from '../config/db.js';
import mongoose from 'mongoose';

// Read-only mirror of cnguserdb User collection
const userSchema = new mongoose.Schema(
    {
        name: String,
        email: String,
        phone: String,
        location: String,
        joinDate: String,
        role: String,
        vehicle: {
            name: String,
            type: String,
            number: String,
        },
    },
    { timestamps: true }
);

export default cngUserConn.model('User', userSchema);
