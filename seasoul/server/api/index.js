const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('../config/db');

// ✅ Load environment variables
require('dotenv').config();

const app = express();

// ✅ CORS Configuration - Allow all origins
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Connect to MongoDB
connectDB();

// ✅ Serve static assets if needed
app.use('/assets', express.static(path.join(__dirname, '../../assets')));

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
    environment: process.env.NODE_ENV || 'production'
  });
});

// ✅ Root Route
app.get('/', (req, res) => {
  res.send('SeaSoul API is running...');
});

// ✅ Export for Vercel
module.exports = app;