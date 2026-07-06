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

// ==================== Admin Profile Controller Functions ====================
const cloudinary = require('../config/cloudinary');

// Get Admin Profile
const getAdminProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.status(200).json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('Error in getAdminProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update Admin Profile
const updateAdminProfile = async (req, res) => {
  try {
    const { fullName, phone, bio, location } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        bio: user.bio,
        location: user.location,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Error in updateAdminProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Upload Admin Profile Image
const uploadAdminProfileImage = async (req, res) => {
  try {
    console.log('📤 Admin Upload request received');
    console.log('📤 Request file:', req.file);

    const userId = req.user.id;

    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    console.log('📤 File received:', req.file.path);

    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Upload to Cloudinary
    console.log('📤 Uploading to Cloudinary...');
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'seasoul/admin-profiles',
      width: 500,
      height: 500,
      crop: 'fill',
      gravity: 'face',
    });

    console.log('✅ Cloudinary upload successful:', result.secure_url);

    // Delete old image from Cloudinary if not default
    if (user.profileImage && !user.profileImage.includes('default-avatar')) {
      try {
        const publicId = user.profileImage.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`seasoul/admin-profiles/${publicId}`);
        console.log('✅ Old image deleted from Cloudinary');
      } catch (err) {
        console.log('⚠️ Could not delete old image:', err.message);
      }
    }

    // Update user profile image
    user.profileImage = result.secure_url;
    await user.save();

    // Delete temporary file
    try {
      fs.unlinkSync(req.file.path);
      console.log('✅ Temporary file deleted');
    } catch (err) {
      console.log('⚠️ Could not delete temp file:', err.message);
    }

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      profileImage: result.secure_url,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('❌ Error in uploadAdminProfileImage:', error);
    
    // Delete temp file if exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.log('⚠️ Could not delete temp file:', err.message);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete Admin Profile Image
const deleteAdminProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete image from Cloudinary if not default
    if (user.profileImage && !user.profileImage.includes('default-avatar')) {
      try {
        const publicId = user.profileImage.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`seasoul/admin-profiles/${publicId}`);
        console.log('✅ Old image deleted from Cloudinary');
      } catch (err) {
        console.log('⚠️ Could not delete old image:', err.message);
      }
    }

    // Set to default
    user.profileImage = 'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile image removed',
      profileImage: user.profileImage,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Error in deleteAdminProfileImage:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

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
// Get admin profile
router.get('/profile', isAdmin, getAdminProfile);

// Update admin profile
router.put('/profile', isAdmin, updateAdminProfile);

// Upload admin profile image
router.post('/profile/upload-image', isAdmin, upload.single('image'), uploadAdminProfileImage);

// Delete admin profile image
router.delete('/profile/image', isAdmin, deleteAdminProfileImage);

// ==================== IMAGE UPLOAD ROUTE (for products/activities) ====================
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
    // ✅ Filter out admin users from the list
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    console.error('❌ Users fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user status (activate/deactivate)
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

// ==================== Bookings Management ====================
// Note: Booking model not yet created, placeholder routes
router.get('/bookings', isAdmin, async (req, res) => {
  try {
    // Placeholder - return empty array
    res.json({ success: true, bookings: [] });
  } catch (error) {
    console.error('❌ Bookings fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/bookings/:id/status', isAdmin, async (req, res) => {
  try {
    // Placeholder
    res.json({ success: true, message: 'Booking status updated' });
  } catch (error) {
    console.error('❌ Booking status update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== Payments Management ====================
// Note: Payment model not yet created, placeholder routes
router.get('/payments', isAdmin, async (req, res) => {
  try {
    // Placeholder - return empty array
    res.json({ success: true, payments: [] });
  } catch (error) {
    console.error('❌ Payments fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;