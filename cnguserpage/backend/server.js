import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import stationRoutes from './routes/stations.js';
import feedbackRoutes from './routes/feedback.js';

const app = express();

// Middleware
// Middleware
app.use(express.json());

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: true, // Allow all origins dynamically for development
    credentials: true,
  })
);

// Connect to MongoDB (non-blocking - app starts regardless)
// Intentionally removed from top-level — see listen callback below

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/feedback', feedbackRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
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

// Start server, then connect to MongoDB
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`\n✓ User Server running on http://localhost:${PORT}`);
  console.log(`✓ API Base: http://localhost:${PORT}/api`);
  console.log(`✓ Health Check: http://localhost:${PORT}/health`);
  console.log(`✓ CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}\n`);

  try {
    await connectDB();
  } catch (error) {
    console.warn('⚠ Server running without MongoDB connection');
  }
});
