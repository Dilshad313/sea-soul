const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Activity = require('../models/Activity');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { isAdmin } = require('../middleware/adminMiddleware');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');
const { createNotificationForAllUsers } = require('../utils/createNotification');
require('dotenv').config();

// ==================== Token Generation ====================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ==================== Admin Login ====================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    console.log('🔐 Admin Login Attempt');
    console.log('📧 Provided Email:', email);

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    if (email !== adminEmail || password !== adminPassword) {
      console.log('❌ Invalid credentials');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    console.log('✅ Admin login successful!');

    let adminUser = await User.findOne({ email: adminEmail });
    
    if (!adminUser) {
      console.log('📝 Creating admin user in database...');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      adminUser = new User({
        fullName: 'Admin',
        email: adminEmail,
        phone: '9999999999',
        password: hashedPassword,
        role: 'admin',
      });
      
      await adminUser.save();
      console.log('✅ Admin user created in database');
    }

    const token = generateToken(adminUser._id);

    res.json({
      success: true,
      token: token,
      user: {
        _id: adminUser._id,
        fullName: adminUser.fullName,
        email: adminUser.email,
        role: adminUser.role || 'admin',
        profileImage: adminUser.profileImage,
      }
    });

  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// ==================== Admin Profile Routes ====================
const {
  getAdminProfile,
  updateAdminProfile,
  uploadAdminProfileImage,
  deleteAdminProfileImage
} = require('../controllers/adminProfileController');

router.get('/profile', isAdmin, getAdminProfile);
router.put('/profile', isAdmin, updateAdminProfile);
router.post('/profile/upload-image', isAdmin, upload.single('image'), uploadAdminProfileImage);
router.delete('/profile/image', isAdmin, deleteAdminProfileImage);

// ==================== IMAGE UPLOAD ROUTE ====================
router.post('/upload', isAdmin, upload.single('image'), async (req, res) => {
  try {
    console.log('📤 Upload request received');
    console.log('📤 File:', req.file);

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image file provided' 
      });
    }

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const imageUrl = `${baseUrl}/uploads/${path.basename(req.file.path)}`;

    console.log('✅ Image uploaded successfully:', imageUrl);

    res.json({
      success: true,
      url: imageUrl,
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.log('⚠️ Could not delete local file:', err.message);
      }
    }

    res.status(500).json({ 
      success: false, 
      message: error.message || 'Upload failed' 
    });
  }
});

// ==================== Dashboard Stats ====================
router.get('/stats', isAdmin, async (req, res) => {
  try {
    const products = await Product.countDocuments();
    const users = await User.countDocuments({ role: 'user' });
    const activities = await Activity.countDocuments();
    const bookings = await Booking.countDocuments();
    const payments = await Payment.countDocuments();
    
    // Calculate total revenue
    const revenueData = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const revenue = revenueData.length > 0 ? revenueData[0].total : 0;

    res.json({ 
      products, 
      bookings, 
      users, 
      revenue, 
      activities,
      payments 
    });
  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== Products Management ====================
router.get('/products', isAdmin, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    console.error('❌ Products fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/products/:id', isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    console.error('❌ Product fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/products', isAdmin, async (req, res) => {
  try {
    console.log('📦 Creating new product...');
    const product = new Product(req.body);
    await product.save();
    console.log('✅ Product created:', product._id);

    const imageUrl = product.images && product.images.length > 0 ? product.images[0] : null;
    
    const notificationCount = await createNotificationForAllUsers(
      '🌟 New Package Added!',
      `🌴 ${product.name} - ₹${product.price} in ${product.location}. Book now!`,
      'product',
      imageUrl,
      product._id
    );
    
    console.log(`✅ Notification sent to ${notificationCount} users`);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    console.error('❌ Product creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.put('/products/:id', isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    console.error('❌ Product update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/products/:id', isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('❌ Product delete error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== Activities Management ====================
router.get('/activities', isAdmin, async (req, res) => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 });
    res.json({ success: true, activities });
  } catch (error) {
    console.error('❌ Activities fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/activities/:id', isAdmin, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }
    res.json({ success: true, activity });
  } catch (error) {
    console.error('❌ Activity fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/activities', isAdmin, async (req, res) => {
  try {
    console.log('⚡ Creating new activity...');
    const activity = new Activity(req.body);
    await activity.save();
    console.log('✅ Activity created:', activity._id);

    const imageUrl = activity.images && activity.images.length > 0 ? activity.images[0] : null;
    
    const notificationCount = await createNotificationForAllUsers(
      '⚡ New Activity Added!',
      `🏄 ${activity.name} - ₹${activity.price} in ${activity.location}. Try it now!`,
      'activity',
      imageUrl,
      activity._id
    );
    
    console.log(`✅ Notification sent to ${notificationCount} users`);

    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      activity,
    });
  } catch (error) {
    console.error('❌ Activity creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.put('/activities/:id', isAdmin, async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }
    res.json({ success: true, activity });
  } catch (error) {
    console.error('❌ Activity update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/activities/:id', isAdmin, async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }
    res.json({ success: true, message: 'Activity deleted' });
  } catch (error) {
    console.error('❌ Activity delete error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== Users Management ====================
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    console.error('❌ Users fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/users/:id/status', isAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('❌ User status update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== Bookings Management (FIXED) ====================
router.get('/bookings', isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'fullName email phone profileImage')
      .populate('productId', 'name price images location')
      .populate('activityId', 'name price images location')
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    console.error('❌ Bookings fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/bookings/:id', isAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'fullName email phone profileImage')
      .populate('productId', 'name price location images')
      .populate('activityId', 'name price location images');
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, booking });
  } catch (error) {
    console.error('❌ Booking fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/bookings/:id/status', isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('userId', 'fullName email phone')
     .populate('productId', 'name price')
     .populate('activityId', 'name price');
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, booking });
  } catch (error) {
    console.error('❌ Booking status update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== Payments Management (FIXED) ====================
router.get('/payments', isAdmin, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('userId', 'fullName email phone profileImage')
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'productId', select: 'name price' },
          { path: 'activityId', select: 'name price' },
          { path: 'userId', select: 'fullName email' }
        ]
      })
      .sort({ createdAt: -1 });
    res.json({ success: true, payments });
  } catch (error) {
    console.error('❌ Payments fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/payments/:id', isAdmin, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('userId', 'fullName email phone profileImage')
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'productId', select: 'name price' },
          { path: 'activityId', select: 'name price' },
          { path: 'userId', select: 'fullName email' }
        ]
      });
    
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    res.json({ success: true, payment });
  } catch (error) {
    console.error('❌ Payment fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== Notifications Management ====================
router.get('/notifications', isAdmin, async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, notifications });
  } catch (error) {
    console.error('❌ Notifications fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;