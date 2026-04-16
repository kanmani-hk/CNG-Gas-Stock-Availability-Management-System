import mongoose from 'mongoose';
import { bunkAdminConn } from '../config/db.js';

const bunkAdminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            default: '',
        },
        role: {
            type: String,
            default: 'bunkadmin',
        },
        // Approval status — set by super admin
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        // Each admin has exactly one station
        assignedStation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Station',
            default: null,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        otp: {
            type: String,
            default: null,
        },
        otpExpires: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

export default bunkAdminConn.models.BunkAdmin || bunkAdminConn.model('BunkAdmin', bunkAdminSchema, 'bunkadmins');
