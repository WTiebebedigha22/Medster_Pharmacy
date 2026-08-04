import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import prescriptionRoutes from './routes/prescriptions.js';
import addressRoutes from './routes/addresses.js';
import adminRoutes from './routes/admin.js';
import webhookRoutes from './routes/webhooks.js';
import wishlistRoutes from './routes/wishlist.js';
import reviewRoutes from './routes/reviews.js';
import notificationRoutes from './routes/notifications.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// =============================================
// MIDDLEWARE
// =============================================

// CORS
app.use(cors({
  origin: config.cors.origin || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing (webhooks need raw body for signature verification)
app.use('/api/webhooks', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files for prescription uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging
if (config.nodeEnv === 'development') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
  });
}

// =============================================
// HEALTH CHECK
// =============================================

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
  });
});

// =============================================
// ROUTES
// =============================================

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);

// =============================================
// ERROR HANDLING
// =============================================

app.use(notFoundHandler);
app.use(errorHandler);

// =============================================
// START SERVER
// =============================================

const startServer = async () => {
  try {
    // Start scheduled sync jobs
    const { startSyncJobs } = await import('./jobs/syncScheduler.js');
    startSyncJobs();

    app.listen(config.port, () => {
      console.log(`
╔══════════════════════════════════════════════╗
║         MEDSTER PHARMACY API SERVER          ║
╠══════════════════════════════════════════════╣
║  Status:  ✅ Running                         ║
║  Port:    ${String(config.port).padEnd(33)}  ║
║  Env:     ${config.nodeEnv.padEnd(33)}       ║
║  CORS:    ${config.cors.origin.padEnd(33)}   ║
╚══════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
