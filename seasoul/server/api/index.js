const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('../config/db');

// ✅ Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();

// ✅ CORS - Allow all origins (for local + hosted)
app.use(cors({
  origin: '*',  // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Connect to MongoDB
connectDB();

// ✅ Serve static assets
app.use('/assets', express.static(path.join(__dirname, '../../assets')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ✅ API Routes
app.use('/api/auth', require('../routes/authRoutes'));
app.use('/api', require('../routes/productRoutes'));
app.use('/api', require('../routes/profileRoutes'));
app.use('/api/admin', require('../routes/adminRoutes'));
app.use('/api', require('../routes/activityRoutes'));
app.use('/api/notifications', require('../routes/notificationRoutes'));
app.use('/api/bookings', require('../routes/bookingRoutes'));
app.use('/api/payments', require('../routes/paymentRoutes'));
app.use('/api/reviews', require('../routes/reviewRoutes'));
app.use('/api/categories', require('../routes/categoryRoutes'));

// ✅ Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SeaSoul API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ✅ Root Route
app.get('/', (req, res) => {
  res.send('SeaSoul API is running...');
});

// ✅ Export for Vercel
module.exports = app;