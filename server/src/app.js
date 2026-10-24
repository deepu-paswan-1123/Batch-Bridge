const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const manufacturerRoutes = require('./routes/manufacturer.routes');
const requirementRoutes = require('./routes/requirement.routes');
const quoteRoutes = require('./routes/quote.routes');
const sampleRoutes = require('./routes/sample.routes');
const orderRoutes = require('./routes/order.routes');
const aiRoutes = require('./routes/ai.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'BatchBridge AI API', time: new Date().toISOString() });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/manufacturers', manufacturerRoutes);
app.use('/api/requirements', requirementRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/samples', sampleRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    code: err.code || 'SERVER_ERROR'
  });
});

module.exports = app;
