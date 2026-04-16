import { superAdminConn } from '../config/db.js';
import mongoose from 'mongoose';

const adminRequestSchema = new mongoose.Schema(
  {
    bunkAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BunkAdmin', // Reference to BunkAdmin model in BunkAdmin DB
    },
    adminEmail: {
      type: String,
      required: true,
    },
    adminName: String,
    stationName: String,
    requestedAction: {
      type: String,
      enum: ['approval', 'deletion', 'reset'],
      default: 'approval',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    remarks: String,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SuperAdmin',
    },
  },
  { timestamps: true }
);

export default superAdminConn.model('AdminRequest', adminRequestSchema, 'admin_requests');
