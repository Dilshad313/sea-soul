const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Activity = require('../models/Activity');
const { isAdmin } = require('../middleware/adminMiddleware');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

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

// ==================== Admin Auth Middleware (Already in adminMiddleware.js) ====================
// We'll use the existing isAdmin from adminMiddleware.js

// ==================== IMAGE UPLOAD ROUTE ====================
// ✅ Add this new route - Image upload
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

    // File is already saved locally by multer
    // Return the file URL
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
    
    // Clean up local file if exists
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
    const users = await User.countDocuments();
    const activities = await Activity.countDocuments();
    res.json({ products, bookings: 0, users, revenue: 0, activities });
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
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('❌ Product creation error:', error);
    res.status(500).json({ success: false, message: error.message });
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
    const activity = new Activity(req.body);
    await activity.save();
    res.status(201).json({ success: true, activity });
  } catch (error) {
    console.error('❌ Activity creation error:', error);
    res.status(500).json({ success: false, message: error.message });
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
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    console.error('❌ Users fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;