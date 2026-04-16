import express from 'express';
import FeedbackRef from '../models/FeedbackRef.js';
import { authenticateSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all feedback (sorted by newest first)
router.get('/', authenticateSuperAdmin, async (req, res) => {
  try {
    const feedback = await FeedbackRef.find().sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    console.error('Fetch feedback error:', error);
    res.status(500).json({ error: 'Server error while fetching feedback' });
  }
});

// Delete feedback
router.delete('/:id', authenticateSuperAdmin, async (req, res) => {
    try {
        await FeedbackRef.findByIdAndDelete(req.params.id);
        res.json({ message: 'Feedback deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting feedback' });
    }
});

export default router;
