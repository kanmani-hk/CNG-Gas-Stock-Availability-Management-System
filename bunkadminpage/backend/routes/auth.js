import express from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import BunkAdmin from '../models/BunkAdmin.js';
import Station from '../models/Station.js';
import { authenticateBunkAdmin } from '../middleware/auth.js';
import { generateOTP, sendOTP } from '../config/email.js';
import { generateCaptcha, verifyCaptcha } from '../config/captcha.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'bunkadmin_secret_key_2026';

// Captcha Store
const captchaStore = new Map();

function createAdminToken(admin) {
    return jwt.sign(
        { userId: admin._id, email: admin.email, role: 'bunkadmin' },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

// Get Captcha Question
router.get('/captcha', (req, res) => {
    const { question, answer } = generateCaptcha();
    const captchaId = Math.random().toString(36).substring(7);
    captchaStore.set(captchaId, answer);
    setTimeout(() => captchaStore.delete(captchaId), 5 * 60 * 1000);
    res.json({ captchaId, question });
});

// ─── REGISTER ───────────────────────────────────────────────
// Registers bunk admin + creates their station in one step
router.post('/register', async (req, res) => {
    try {
        const {
            // Admin details
            name, email, password, phone,
            // Bunk/Station details
            bunkName, bunkAddress, bunkLat, bunkLng, bunkPrice, bunkOperatingHours,
            // Security details
            captchaId, captchaAnswer,
        } = req.body;

        // Verify Captcha
        if (!captchaId || !captchaAnswer) {
            return res.status(400).json({ error: 'Security Captcha check is required' });
        }
        if (!verifyCaptcha(captchaAnswer, captchaStore.get(captchaId))) {
            return res.status(400).json({ error: 'Invalid security answer' });
        }
        captchaStore.delete(captchaId);

        // Validate admin fields
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }


        // Validate bunk fields
        if (!bunkName || !bunkAddress) {
            return res.status(400).json({ error: 'Bunk name and address are required' });
        }

        if (bunkLat === undefined || bunkLng === undefined) {
            return res.status(400).json({ error: 'Bunk latitude and longitude are required' });
        }

        if (!bunkPrice) {
            return res.status(400).json({ error: 'Bunk price per kg is required' });
        }

        // Check if admin already exists
        const existingAdmin = await BunkAdmin.findOne({ email: email.toLowerCase() });
        if (existingAdmin) {
            return res.status(400).json({ error: 'Bunk admin already exists with this email' });
        }

        // Hash password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        // Create the admin first (without station reference)
        const newAdmin = new BunkAdmin({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            phone: phone || '',
            otp,
            otpExpires,
            isVerified: false,
        });
        await newAdmin.save();

        // Create the station linked to this admin (starts as pending)
        const newStation = new Station({
            name: bunkName,
            address: bunkAddress,
            lat: parseFloat(bunkLat),
            lng: parseFloat(bunkLng),
            pricePerKg: parseFloat(bunkPrice),
            operatingHours: bunkOperatingHours || '24/7',
            stockLevel: 500, // default 500 kg
            status: 'pending',
            ownedBy: newAdmin._id,
        });
        await newStation.save();

        // Link the station to the admin
        newAdmin.assignedStation = newStation._id;
        newAdmin.status = 'pending';
        await newAdmin.save();

        const emailSent = await sendOTP(newAdmin.email, otp);

        // Do NOT issue a login token — admin must wait for email verification AND approval
        res.status(201).json({
            message: emailSent
                ? 'Registration submitted! Please verify your email first.'
                : 'Registration submitted. Please check console for OTP (Email sending failed).',
            status: 'pending',
            needsVerification: true,
            email: newAdmin.email,
        });
    } catch (error) {
        console.error('BunkAdmin register error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// ─── LOGIN ──────────────────────────────────────────────────
// Returns admin info + their assigned station
router.post('/login', async (req, res) => {
    try {
        const { email, password, captchaId, captchaAnswer } = req.body;

        if (!email || !password || !captchaId || !captchaAnswer) {
            return res.status(400).json({ error: 'Email, password, and Captcha are required' });
        }

        if (!verifyCaptcha(captchaAnswer, captchaStore.get(captchaId))) {
            return res.status(400).json({ error: 'Invalid Captcha answer' });
        }
        captchaStore.delete(captchaId);

        const admin = await BunkAdmin.findOne({ email: email.toLowerCase() });
        if (!admin) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcryptjs.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (!admin.isVerified) {
            return res.status(403).json({
                error: 'Email verified is required.',
                needsVerification: true,
                email: admin.email
            });
        }

        // Block login for unapproved admins
        if (admin.status === 'pending') {
            return res.status(403).json({
                error: 'Your registration is pending approval by the Super Admin. You will be notified once approved.',
                status: 'pending',
            });
        }
        if (admin.status === 'rejected') {
            return res.status(403).json({
                error: 'Your registration was rejected by the Super Admin. Please contact support.',
                status: 'rejected',
            });
        }

        // Fetch the admin's assigned station
        let station = null;
        if (admin.assignedStation) {
            station = await Station.findById(admin.assignedStation);
        }

        const token = createAdminToken(admin);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                phone: admin.phone,
                role: 'bunkadmin',
            },
            station: station || null,
        });
    } catch (error) {
        console.error('BunkAdmin login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const admin = await BunkAdmin.findOne({
            email: email.toLowerCase(),
            otp,
            otpExpires: { $gt: Date.now() }
        });

        if (!admin) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        admin.isVerified = true;
        admin.otp = null;
        admin.otpExpires = null;
        await admin.save();

        res.json({
            message: 'Email verified successfully! Please wait for Super Admin approval.',
            status: admin.status
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ error: 'Server error during verification' });
    }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;
        const admin = await BunkAdmin.findOne({ email: email.toLowerCase(), isVerified: false });

        if (!admin) {
            return res.status(404).json({ error: 'Admin not found or already verified' });
        }

        const otp = generateOTP();
        admin.otp = otp;
        admin.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await admin.save();

        const emailSent = await sendOTP(admin.email, otp);

        res.json({
            message: emailSent
                ? 'New OTP sent successfully'
                : 'New OTP generated. Please check console (Email sending failed).'
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email, captchaId, captchaAnswer } = req.body;

        // Verify Captcha
        if (!captchaId || !captchaAnswer) {
            return res.status(400).json({ error: 'Security verification required' });
        }
        if (!verifyCaptcha(captchaAnswer, captchaStore.get(captchaId))) {
            return res.status(400).json({ error: 'Invalid security answer' });
        }
        captchaStore.delete(captchaId);

        const admin = await BunkAdmin.findOne({ email: email.toLowerCase() });


        if (!admin) {
            return res.json({ message: 'If an account exists with this email, a reset code has been sent.' });
        }

        const otp = generateOTP();
        admin.otp = otp;
        admin.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await admin.save();

        const emailSent = await sendOTP(admin.email, otp);

        res.json({
            message: emailSent
                ? 'If an account exists with this email, a reset code has been sent.'
                : 'Password reset code generated. Please check console (Email sending failed).'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ error: 'Email, OTP, and new password are required' });
        }

        const admin = await BunkAdmin.findOne({
            email: email.toLowerCase(),
            otp,
            otpExpires: { $gt: Date.now() }
        });

        if (!admin) {
            return res.status(400).json({ error: 'Invalid or expired reset code' });
        }

        const salt = await bcryptjs.genSalt(10);
        admin.password = await bcryptjs.hash(newPassword, salt);
        admin.otp = null;
        admin.otpExpires = null;
        admin.isVerified = true;
        await admin.save();

        res.json({ message: 'Password reset successfully. You can now login.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Server error during password reset' });
    }
});

// ─── GET MY STATION ─────────────────────────────────────────
// Returns the logged-in admin's own station only
router.get('/me/station', authenticateBunkAdmin, async (req, res) => {
    try {
        const admin = await BunkAdmin.findById(req.user.userId);
        if (!admin || !admin.assignedStation) {
            return res.status(404).json({ error: 'No station assigned' });
        }

        const station = await Station.findById(admin.assignedStation);
        if (!station) {
            return res.status(404).json({ error: 'Station not found' });
        }

        res.json(station);
    } catch (error) {
        console.error('Get my station error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ─── UPDATE MY PROFILE ─────────────────────────────────────
router.put('/me/profile', authenticateBunkAdmin, async (req, res) => {
    try {
        const adminId = req.user.userId;
        const { name, email, phone, newPassword } = req.body;

        const admin = await BunkAdmin.findById(adminId);
        if (!admin) {
             return res.status(404).json({ error: 'Admin not found' });
        }

        if (name) admin.name = name;
        if (phone !== undefined) admin.phone = phone;
        if (email && email.toLowerCase() !== admin.email) {
            const existing = await BunkAdmin.findOne({ email: email.toLowerCase() });
            if (existing && existing._id.toString() !== adminId) {
                return res.status(400).json({ error: 'Email is already in use by another account' });
            }
            admin.email = email.toLowerCase();
        }

        if (newPassword && newPassword.trim().length > 0) {
            const salt = await bcryptjs.genSalt(10);
            admin.password = await bcryptjs.hash(newPassword, salt);
        }

        await admin.save();

        res.json({
             message: 'Profile updated successfully',
             user: {
                 id: admin._id,
                 name: admin.name,
                 email: admin.email,
                 phone: admin.phone,
                 role: 'bunkadmin',
             }
        });
    } catch (error) {
         console.error('Update profile error:', error);
         res.status(500).json({ error: 'Server error updating profile' });
    }
});

export default router;
