import express from 'express';
import UserRef from '../models/UserRef.js';
import { authenticateSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

// ── GET ALL USERS ──────────────────────────────────────────
router.get('/', authenticateSuperAdmin, async (req, res) => {
    try {
        const users = await UserRef.find().sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── DELETE USER ────────────────────────────────────────────
router.delete('/:id', authenticateSuperAdmin, async (req, res) => {
    try {
        const user = await UserRef.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── GET USER STATS ─────────────────────────────────────────
router.get('/stats/summary', authenticateSuperAdmin, async (req, res) => {
    try {
        const total = await UserRef.countDocuments();
        // Count registrations in the last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const newThisWeek = await UserRef.countDocuments({ createdAt: { $gte: weekAgo } });
        res.json({ total, newThisWeek });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
