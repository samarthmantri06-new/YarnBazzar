require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');

const authRoutes   = require('./routes/auth');
const supplierRoutes = require('./routes/supplier');
const buyerRoutes  = require('./routes/buyer');
const adminRoutes  = require('./routes/admin');
const sharedRoutes = require('./routes/shared');

const app = express();

// Trust the first proxy (Render) so rate limiters work correctly
app.set('trust proxy', 1);

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (same-origin, mobile apps, Postman)
    if (!origin) return callback(null, true);
    const allowed = [
      'http://localhost:5000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'https://yarnbazzar.onrender.com',
      process.env.CLIENT_SUPPLIER_URL,
      process.env.CLIENT_BUYER_URL,
      process.env.CLIENT_ADMIN_URL,
    ].filter(Boolean);
    if (allowed.includes(origin)) return callback(null, true);
    // Allow any onrender.com subdomain
    if (origin.endsWith('.onrender.com')) return callback(null, true);
    return callback(null, true); // Allow all for now since frontend is same-origin
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

// ─── Serve plain HTML frontend ─────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../../frontend')));

// ─── Global Rate Limiter ──────────────────────────────────────────────────────
const globalLimiter = rateLimit({ validate: { xForwardedForHeader: false },
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(globalLimiter);

// ─── Auth Rate Limiter (stricter) ─────────────────────────────────────────────
const authLimiter = rateLimit({ validate: { xForwardedForHeader: false },
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts, please try again later.' }
});

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static Files (local uploads) ────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'YarnMarket API', timestamp: new Date().toISOString() });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',   authLimiter, authRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/buyer',  buyerRoutes);
app.use('/api/admin',  adminRoutes);
app.use('/api',        sharedRoutes);

// ─── 404 Handler (API only) ──────────────────────────────────────────────────
app.use('/api', (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error'
  });
});

module.exports = app;
