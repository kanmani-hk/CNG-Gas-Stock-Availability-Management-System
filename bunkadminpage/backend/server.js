import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import stationRoutes from './routes/stations.js';
import StationModel from './models/Station.js';

const app = express();

// 1. CORS MUST BE FIRST
app.use(
    cors({
        origin: true,
        credentials: true,
    })
);

// 2. PARSERS
app.use(express.json());

// 3. LOGGING
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);

app.get('/api/ping', (req, res) => res.json({ message: 'BunkAdmin API is alive' }));


// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'BunkAdmin server is running', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err.message);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Start server then connect DB
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174').split(',').map(o => o.trim());
const PORT = process.env.PORT || 5001;
app.listen(PORT, async () => {
    console.log(`\n✓ BunkAdmin Server running on http://localhost:${PORT}`);
    console.log(`✓ API Base: http://localhost:${PORT}/api`);
    console.log(`✓ Health Check: http://localhost:${PORT}/health`);
    console.log(`✓ CORS Origins: ${allowedOrigins.join(', ')}\n`);

    // Connect to MongoDB after server is already listening
    try {
        await connectDB();
    } catch (error) {
        console.warn('⚠ BunkAdmin server running without MongoDB');
    }
});
