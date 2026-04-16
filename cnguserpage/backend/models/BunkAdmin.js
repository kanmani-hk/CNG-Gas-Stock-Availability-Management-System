import { bunkAdminConn } from '../config/db.js';
import mongoose from 'mongoose';

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
            enum: ['bunkadmin'],
        },
        assignedStations: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Station',
            },
        ],
    },
    { timestamps: true }
);

export default bunkAdminConn.models.BunkAdmin || bunkAdminConn.model('BunkAdmin', bunkAdminSchema, 'bunkadmins');
