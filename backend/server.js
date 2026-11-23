require('dotenv').config();
const { validateEnv } = require('./config/env');
try { validateEnv(); } catch (error) { console.error(`Startup configuration error: ${error.message}`); process.exit(1); }
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const customerRoutes = require('./routes/customerRoutes');
const accountRoutes = require('./routes/accountRoutes');
const loanRoutes = require('./routes/loanRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const authRoutes = require('./routes/authRoutes');
const { authenticate, authorizeRole } = require('./middleware/auth');
const { sanitize } = require('./middleware/validate');
const rateLimit = require('./middleware/rateLimit');
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('./middleware/cookies');

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((x) => x.trim()).filter(Boolean);
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set({ 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'no-referrer', 'X-DNS-Prefetch-Control': 'off', 'X-Download-Options': 'noopen', 'X-Permitted-Cross-Domain-Policies': 'none', 'Origin-Agent-Cluster': '?1', 'Cross-Origin-Opener-Policy': 'same-origin', 'Cross-Origin-Resource-Policy': 'same-site', 'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'" });
  if (process.env.NODE_ENV === 'production' && req.secure) res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser);
app.use(sanitize);
app.use('/api', rateLimit({ windowMs: 60000, max: 120 }));
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }));
app.use('/api/auth', authRoutes);
app.use('/api/customers', authenticate, authorizeRole('manager'), customerRoutes);
app.use('/api/accounts', authenticate, authorizeRole('manager'), accountRoutes);
app.use('/api/loans', authenticate, authorizeRole('manager'), loanRoutes);
app.use('/api/transactions', authenticate, authorizeRole('manager'), transactionRoutes);
app.get('/api', (req, res) => res.json({ message: 'Banking System API - Manager Dashboard' }));
app.use('/api', (req, res) => res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` }));
app.use(errorHandler);

connectDB().then(() => {
  const server = app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  server.on('error', (err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
}).catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
