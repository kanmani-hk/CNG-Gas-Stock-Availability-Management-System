import mongoose from 'mongoose';
import { cngUserConn } from '../config/db.js';

// Define the schema (must match the one in cnguserpage backend)
const feedbackSchema = new mongoose.Schema({
  name: String,
  email: String,
  subject: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

// Create the model on the cngUserConn connection
const FeedbackRef = cngUserConn.model('Feedback', feedbackSchema);

export default FeedbackRef;
