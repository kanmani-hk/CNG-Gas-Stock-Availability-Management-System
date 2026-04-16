import express from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import UserSettings from '../models/UserSettings.js';
import Vehicle from '../models/Vehicle.js';
import LoginAttempt from '../models/LoginAttempt.js';
import { generateOTP, sendOTP } from '../config/email.js';
import { generateCaptcha, verifyCaptcha } from '../config/captcha.js';

const router = express.Router();

// JWT helper
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

// Captcha Store (should use Redis for production)
const captchaStore = new Map();

function createToken(user) {
  return jwt.sign(
    { userId: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Get Captcha Questions
router.get('/captcha', (req, res) => {
  const { question, answer } = generateCaptcha();
  const captchaId = Math.random().toString(36).substring(7);
  captchaStore.set(captchaId, answer);

  // Cleanup
  setTimeout(() => captchaStore.delete(captchaId), 5 * 60 * 1000);

  res.json({ captchaId, question });
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, vehicleName, vehicleType, vehicleNumber, captchaId, captchaAnswer } = req.body;

    // Verify Captcha
    if (!captchaId || !captchaAnswer) {
      return res.status(400).json({ error: 'Security Captcha check is required' });
    }
    if (!verifyCaptcha(captchaAnswer, captchaStore.get(captchaId))) {
      return res.status(400).json({ error: 'Invalid security answer' });
    }
    captchaStore.delete(captchaId);

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (!vehicleName || !vehicleType || !vehicleNumber) {
      return res.status(400).json({ error: 'Vehicle name, type and number are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      vehicle: {
        name: vehicleName || '',
        type: vehicleType || '',
        number: vehicleNumber || '',
      },
      settings: {
        notifications: true,
        darkMode: false,
      },
      otp,
      otpExpires,
      isVerified: false,
    });


    await newUser.save();

    // ── SYNC SEPARATE COLLECTIONS ──────────────────────────
    // Create initial Vehicle entry
    await Vehicle.create({
      userId: newUser._id,
      name: vehicleName || '',
      type: vehicleType || 'CNG Car',
      number: vehicleNumber || '',
      isPrimary: true
    });

    // Create initial Settings entry
    await UserSettings.create({
      userId: newUser._id,
      notifications: true,
      locationTracking: true,
      autoRefresh: true,
      darkMode: false,
      units: 'metric',
      language: 'english'
    });
    // ─────────────────────────────────────────────────────────

    const emailSent = await sendOTP(newUser.email, otp);

    res.status(201).json({
      message: emailSent
        ? 'User registered successfully. Please verify your email.'
        : 'User registered. Please check console for OTP (Email sending failed).',
      email: newUser.email,
      needsVerification: true
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
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

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      await LoginAttempt.create({
        email: email.toLowerCase(),
        success: false,
        ip: req.ip,
      });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatchPassword = await bcryptjs.compare(password, user.password);
    if (!isMatchPassword) {
      await LoginAttempt.create({
        email: email.toLowerCase(),
        user: user._id,
        success: false,
        ip: req.ip,
      });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        error: 'Email already registered but not verified.',
        needsVerification: true,
        email: user.email
      });
    }

    await LoginAttempt.create({
      email: email.toLowerCase(),
      user: user._id,
      success: true,
      ip: req.ip,
    });

    const token = createToken(user);

    // ── SYNC SEPARATE COLLECTIONS ON LOGIN ─────────────────
    // Check if vehicle exists in split collection, if not, create it from embedded user data
    let vehicleInfo = await Vehicle.findOne({ userId: user._id, isPrimary: true });
    if (!vehicleInfo && user.vehicle?.number) {
        vehicleInfo = await Vehicle.create({
            userId: user._id,
            name: user.vehicle?.name || '',
            type: user.vehicle?.type || 'CNG Car',
            number: user.vehicle?.number || '',
            isPrimary: true
        });
    }

    // Check if settings exists in split collection, if not, create it
    let settingsInfo = await UserSettings.findOne({ userId: user._id });
    if (!settingsInfo) {
        settingsInfo = await UserSettings.create({
            userId: user._id,
            notifications: user.settings?.notifications ?? true,
            darkMode: user.settings?.darkMode ?? false,
        });
    }
    // ─────────────────────────────────────────────────────────

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        joinDate: user.joinDate,
        vehicle: user.vehicle,
        settings: user.settings,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      otp,
      otpExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = createToken(user);

    res.json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        joinDate: user.joinDate,
        vehicle: user.vehicle,
      },
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
    const user = await User.findOne({ email: email.toLowerCase(), isVerified: false });

    if (!user) {
      return res.status(404).json({ error: 'User not found or already verified' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const emailSent = await sendOTP(user.email, otp);

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
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // For security, don't reveal if user exists. Just say "If exists, OTP sent"
      return res.json({ message: 'If an account exists with this email, a reset code has been sent.' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await user.save();

    const emailSent = await sendOTP(user.email, otp);

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

    const user = await User.findOne({
      email: email.toLowerCase(),
      otp,
      otpExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset code' });
    }

    const salt = await bcryptjs.genSalt(10);
    user.password = await bcryptjs.hash(newPassword, salt);
    user.otp = null;
    user.otpExpires = null;
    user.isVerified = true; // Also verify if they reset password
    await user.save();

    res.json({ message: 'Password reset successfully. You can now login.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error during password reset' });
  }
});

// JWT auth middleware
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;