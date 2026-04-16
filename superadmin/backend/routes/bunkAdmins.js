import express from 'express';
import BunkAdminRef from '../models/BunkAdminRef.js';
import StationRef from '../models/StationRef.js';
import AdminRequest from '../models/AdminRequest.js';
import { authenticateSuperAdmin } from '../middleware/auth.js';


const router = express.Router();

// ── GET ALL BUNK ADMINS ────────────────────────────────────
router.get('/', authenticateSuperAdmin, async (req, res) => {
    try {
        const admins = await BunkAdminRef.find()
            .populate('assignedStation')
            .sort({ createdAt: -1 });
        res.json(admins);
    } catch (error) {
        console.error('Get bunk admins error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── GET PENDING APPROVALS ──────────────────────────────────
router.get('/pending', authenticateSuperAdmin, async (req, res) => {
    try {
        const pending = await BunkAdminRef.find({ status: 'pending' })
            .populate('assignedStation')
            .sort({ createdAt: -1 });
        res.json(pending);
    } catch (error) {
        console.error('Get pending error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── APPROVE BUNK ADMIN ─────────────────────────────────────
router.put('/:id/approve', authenticateSuperAdmin, async (req, res) => {
    try {
        const admin = await BunkAdminRef.findByIdAndUpdate(
            req.params.id,
            { status: 'approved' },
            { new: true }
        ).populate('assignedStation');

        if (!admin) return res.status(404).json({ error: 'Bunk admin not found' });

        // 1. Log in Request Table - Bunk admin entry approval/reject (superadmindb)
        await AdminRequest.create({
            bunkAdminId: admin._id,
            adminEmail: admin.email,
            adminName: admin.name,
            stationName: admin.assignedStation ? admin.assignedStation.name : 'Unknown',
            requestedAction: 'approval',
            status: 'approved',
            remarks: 'Entry approved by Super Admin',
            processedBy: req.user.userId
        });

        // 2. Also approve their station
        if (admin.assignedStation) {
            await StationRef.findByIdAndUpdate(admin.assignedStation._id, { status: 'approved' });
        }

        res.json({ message: 'Bunk admin approved and logged successfully', admin });

    } catch (error) {
        console.error('Approve error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── REJECT BUNK ADMIN ──────────────────────────────────────
router.put('/:id/reject', authenticateSuperAdmin, async (req, res) => {
    try {
        const { reason } = req.body;
        const admin = await BunkAdminRef.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected' },
            { new: true }
        ).populate('assignedStation');

        if (!admin) return res.status(404).json({ error: 'Bunk admin not found' });

        // 1. Log in Request Table - Bunk admin entry approval/reject (superadmindb)
        await AdminRequest.create({
            bunkAdminId: admin._id,
            adminEmail: admin.email,
            adminName: admin.name,
            stationName: admin.assignedStation ? admin.assignedStation.name : 'Unknown',
            requestedAction: 'approval', // classification shows typical registration entry
            status: 'rejected',
            remarks: reason || 'Entry rejected by Super Admin',
            processedBy: req.user.userId
        });

        if (admin.assignedStation) {
            await StationRef.findByIdAndUpdate(admin.assignedStation._id, { status: 'rejected' });
        }

        res.json({ message: 'Bunk admin rejection logged', admin, reason });

    } catch (error) {
        console.error('Reject error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── DELETE BUNK ADMIN ──────────────────────────────────────
router.delete('/:id', authenticateSuperAdmin, async (req, res) => {
    try {
        const admin = await BunkAdminRef.findById(req.params.id);
        if (!admin) return res.status(404).json({ error: 'Bunk admin not found' });

        // Delete their station too
        if (admin.assignedStation) {
            await StationRef.findByIdAndDelete(admin.assignedStation);
        }
        await BunkAdminRef.findByIdAndDelete(req.params.id);

        res.json({ message: 'Bunk admin and station deleted successfully' });
    } catch (error) {
        console.error('Delete bunk admin error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ── GET STATS ──────────────────────────────────────────────
router.get('/stats/summary', authenticateSuperAdmin, async (req, res) => {
    try {
        const [total, approved, pending, rejected] = await Promise.all([
            BunkAdminRef.countDocuments(),
            BunkAdminRef.countDocuments({ status: 'approved' }),
            BunkAdminRef.countDocuments({ status: 'pending' }),
            BunkAdminRef.countDocuments({ status: 'rejected' }),
        ]);
        res.json({ total, approved, pending, rejected });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ── GET ALL BOOKINGS (GLOBAL) ──────────────────────────────
router.get('/stats/all-bookings', authenticateSuperAdmin, async (req, res) => {
    try {
        const stations = await StationRef.find({ status: 'approved' }).select('name bookings');
        let allBookings = [];
        stations.forEach(s => {
            const stationBookings = s.bookings.map(b => ({
                ...b.toObject(),
                stationName: s.name,
                stationId: s._id
            }));
            allBookings = allBookings.concat(stationBookings);
        });
        
        // Sort by newest first
        allBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        res.json(allBookings);
    } catch (error) {
        console.error('Get all bookings error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
