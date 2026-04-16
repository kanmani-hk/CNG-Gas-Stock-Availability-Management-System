import express from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import BunkAdmin from '../models/BunkAdmin.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

function createAdminToken(admin) {
    return jwt.sign(
        { userId: admin._id, email: admin.email, role: 'bunkadmin' },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

// Register a new bunk admin
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        const existingAdmin = await BunkAdmin.findOne({ email: email.toLowerCase() });
        if (existingAdmin) {
            return res.status(400).json({ error: 'Bunk admin already exists with this email' });
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        const newAdmin = new BunkAdmin({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            phone: phone || '',
        });

        await newAdmin.save();

        const token = createAdminToken(newAdmin);

        res.status(201).json({
            message: 'Bunk admin registered successfully',
            token,
            user: {
                id: newAdmin._id,
                name: newAdmin.name,
                email: newAdmin.email,
                phone: newAdmin.phone,
                role: 'bunkadmin',
            },
        });
    } catch (error) {
        console.error('BunkAdmin register error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Bunk admin login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const admin = await BunkAdmin.findOne({ email: email.toLowerCase() });
        if (!admin) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcryptjs.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = createAdminToken(admin);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: 'bunkadmin',
            },
        });
    } catch (error) {
        console.error('BunkAdmin login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Auth middleware for bunk admin
export function authenticateBunkAdmin(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = decoded;
        next();
    });
}

// Get current bunk admin profile
router.get('/me', authenticateBunkAdmin, async (req, res) => {
    try {
        const admin = await BunkAdmin.findById(req.user.userId).select('-password');
        if (!admin) {
            return res.status(404).json({ error: 'Bunk admin not found' });
        }
        res.json(admin);
    } catch (error) {
        console.error('Get bunk admin error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
