const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ==================== Admin Login (Only .env credentials) ====================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    console.log('🔐 Admin Login Attempt');
    console.log('📧 Provided Email:', email);
    console.log('📧 Admin Email from .env:', adminEmail);

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    if (email !== adminEmail) {
      console.log('❌ Email mismatch');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    if (password !== adminPassword) {
      console.log('❌ Password mismatch');
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

// ==================== Admin Auth Middleware ====================
const isAdmin = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized, no token' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Token verification error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized, token failed' 
    });
  }
};

// ==================== Dashboard Stats ====================
router.get('/stats', isAdmin, async (req, res) => {
  try {
    const products = await Product.countDocuments();
    const users = await User.countDocuments();
    res.json({ products, bookings: 0, users, revenue: 0 });
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