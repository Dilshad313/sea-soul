const express = require('express');
const cors = require('cors');
// const mongoose = require('mongoose');
const connectDB = require('./config/db');
const path = require('path'); // ✅ ADD THIS - it's missing
require('dotenv').config();

const app = express();

// ✅ CORS Configuration
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

// ✅ Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// ✅ Import Razorpay Routes
const razorpayRoutes = require('./routes/razorpayRoutes');

// ✅ API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/productRoutes'));
app.use('/api', require('./routes/profileRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api', require('./routes/activityRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));

// ✅ ADD THIS - Razorpay Routes
app.use('/api/razorpay', razorpayRoutes);

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message
  });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 Admin API: http://localhost:${PORT}/api/admin`);
  console.log(`📍 Razorpay API: http://localhost:${PORT}/api/razorpay`);
  console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
});

// ✅ Get local IP address
function getLocalIP() {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}