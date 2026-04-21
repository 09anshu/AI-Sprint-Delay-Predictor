/**
 * server.js — Main Express Server.
 * 
 * Entry point for the AI Sprint Delay Predictor backend.
 * Sets up Express, connects to MongoDB, and mounts API routes.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const sprintRoutes = require('./routes/sprints');
const adminRoutes = require('./routes/admin');

const app = express();

// ─── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB();

// ─── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/admin', adminRoutes);

// ─── Health Check ───────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'AI Sprint Delay Predictor API',
    timestamp: new Date().toISOString(),
  });
});

// ─── Error Handling Middleware ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// ─── Start Server ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 AI Sprint Delay Predictor API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Auth:   http://localhost:${PORT}/api/auth`);
  console.log(`   API:    http://localhost:${PORT}/api/projects`);
  console.log(`   API:    http://localhost:${PORT}/api/sprints\n`);
});
