import { superAdminConn } from '../config/db.js';
import mongoose from 'mongoose';

const superAdminSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },
        role: { type: String, default: 'superadmin' },
    },
    { timestamps: true }
);

export default superAdminConn.model('SuperAdmin', superAdminSchema, 'superadmins');

