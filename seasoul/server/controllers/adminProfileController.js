const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// Get Admin Profile
exports.getAdminProfile = async (req, res) => {
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
exports.updateAdminProfile = async (req, res) => {
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
exports.uploadAdminProfileImage = async (req, res) => {
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
exports.deleteAdminProfileImage = async (req, res) => {
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