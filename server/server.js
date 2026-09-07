import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { initSocket, getIO } from './utils/socket.js';
import authRoutes from './routes/authRoutes.js';
import tokenRoutes from './routes/tokenRoutes.js';
import counterRoutes from './routes/counterRoutes.js';
import queueRoutes from './routes/queueRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Queueless Backend API',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/counters', counterRoutes);
app.use('/api/queue', queueRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Queueless Smart Queue & Lounge Management API',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      tokens: '/api/tokens',
      counters: '/api/counters',
      queue: '/api/queue',
    },
  });
});

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

// Start server immediately
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Queueless Server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io connected and ready for live queue sync`);
  console.log(`=======================================================`);
});

// Initialize database
connectDB().catch((err) => {
  console.error('[Database] Connection notice:', err.message);
});

export { app, server, getIO };
