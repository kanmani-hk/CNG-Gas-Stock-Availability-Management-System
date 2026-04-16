import express from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import SuperAdmin from '../models/SuperAdmin.js';
import { authenticateSuperAdmin } from '../middleware/auth.js';
import { generateCaptcha, verifyCaptcha } from '../config/captcha.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'superadmin_secret_key_2026';

// Captcha Store
const captchaStore = new Map();

// Get Captcha Questions
router.get('/captcha', (req, res) => {
    const { question, answer } = generateCaptcha();
    const captchaId = Math.random().toString(36).substring(7);
    captchaStore.set(captchaId, answer);
    setTimeout(() => captchaStore.delete(captchaId), 5 * 60 * 1000); // 5 mins
    res.json({ captchaId, question });
});

function createToken(admin) {
    return jwt.sign(
        { userId: admin._id, email: admin.email, role: 'superadmin' },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

// ── LOGIN ──────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password, captchaId, captchaAnswer } = req.body;
        
        if (!email || !password || !captchaId || !captchaAnswer) {
            return res.status(400).json({ error: 'Email, password, and Captcha are required' });
        }

        // Verify Captcha
        const storedAnswer = captchaStore.get(captchaId);
        if (!verifyCaptcha(captchaAnswer, storedAnswer)) {
            return res.status(400).json({ error: 'Invalid Captcha answer' });
        }
        captchaStore.delete(captchaId);

        const admin = await SuperAdmin.findOne({ email: email.toLowerCase() });
        if (!admin) return res.status(401).json({ error: 'Invalid email or password' });

        const isMatch = await bcryptjs.compare(password, admin.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

        const token = createToken(admin);
        res.json({
            message: 'Login successful',
            token,
            user: { id: admin._id, name: admin.name, email: admin.email, role: 'superadmin' },
        });
    } catch (error) {
        console.error('SuperAdmin login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// ── GET ME ────────────────────────────────────────────────
router.get('/me', authenticateSuperAdmin, async (req, res) => {
    try {
        const admin = await SuperAdmin.findById(req.user.userId).select('-password');
        if (!admin) return res.status(404).json({ error: 'Super admin not found' });
        res.json(admin);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
