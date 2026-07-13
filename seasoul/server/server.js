const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');

// ✅ Load environment variables
dotenv.config();

// ✅ Connect to MongoDB
connectDB();

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

// ✅ Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));

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

app.get('/', (req, res) => {
  res.send('SeaSoul API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Admin API: http://localhost:${PORT}/api/admin`);
  console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
});