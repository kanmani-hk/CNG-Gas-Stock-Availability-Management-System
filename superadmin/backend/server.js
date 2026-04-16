import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectAllDBs } from './config/db.js';
import authRoutes from './routes/auth.js';
import bunkAdminRoutes from './routes/bunkAdmins.js';
import userRoutes from './routes/users.js';
import feedbackRoutes from './routes/feedback.js';
import settingsRoutes from './routes/settings.js';

dotenv.config();

const app = express();
app.use(express.json());

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5175,http://localhost:5176')
    .split(',').map((o) => o.trim());

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bunkadmins', bunkAdminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'SuperAdmin server is running', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, _req, res, _next) => {
    console.error('Server error:', err.message);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

// 404
app.use((_req, res) => res.status(404).json({ error: 'Not Found' }));

const PORT = process.env.PORT || 5002;
app.listen(PORT, async () => {
    console.log(`\n✓ SuperAdmin Server running on http://localhost:${PORT}`);
    console.log(`✓ API Base: http://localhost:${PORT}/api`);
    console.log(`✓ CORS Origins: ${allowedOrigins.join(', ')}\n`);
    try {
        await connectAllDBs();
    } catch (error) {
        console.warn('⚠ SuperAdmin server running with partial DB connectivity');
    }
});
