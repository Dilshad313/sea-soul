const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');
const { createNotification } = require('../utils/createNotification');

// ✅ Get User Profile
exports.getProfile = async (req, res) => {
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
    console.error('Error in getProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ✅ Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phone, bio, location } = req.body;
    const userId = req.user.id;

    console.log('📝 Updating profile for user:', userId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const changes = [];
    let notificationMessage = 'Your profile has been updated: ';
    
    if (fullName && fullName !== user.fullName) {
      changes.push('name');
      user.fullName = fullName;
    }
    if (phone && phone !== user.phone) {
      changes.push('phone');
      user.phone = phone;
    }
    if (bio !== undefined && bio !== user.bio) {
      changes.push('bio');
      user.bio = bio;
    }
    if (location !== undefined && location !== user.location) {
      changes.push('location');
      user.location = location;
    }

    if (changes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No changes detected'
      });
    }

    await user.save();
    console.log('✅ Profile updated:', userId);

    notificationMessage += changes.join(', ');

    await createNotification(
      userId,
      '👤 Profile Updated',
      notificationMessage,
      'profile',
      null,
      user.profileImage,
      { changes }
    );
    console.log('✅ Profile update notification created');

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
      }
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ✅ Upload Profile Image - FIXED
exports.uploadProfileImage = async (req, res) => {
  try {
    console.log('📤 Profile Upload request received');
    console.log('📤 Request body keys:', Object.keys(req.body));

    const userId = req.user.id;
    let imageUrl;

    // ✅ Check if image is in body (base64)
    if (req.body.image) {
      console.log('📤 Uploading base64 image...');
      
      const imageData = req.body.image;
      if (!imageData || typeof imageData !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Invalid image data'
        });
      }
      
      if (!imageData.startsWith('data:image')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid image format. Expected base64 image data.'
        });
      }
      
      const result = await cloudinary.uploader.upload(imageData, {
        folder: 'seasoul/profiles',
        width: 500,
        height: 500,
        crop: 'fill',
        gravity: 'face',
        quality: 'auto:good',
        format: 'jpg'
      });
      imageUrl = result.secure_url;
      console.log('✅ Cloudinary upload successful:', imageUrl);
      
    } else {
      console.log('❌ No image in request');
      return res.status(400).json({
        success: false,
        message: 'No image provided. Please send image as base64.'
      });
    }

    if (!imageUrl) {
      throw new Error('Image upload failed - no URL returned');
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old image from Cloudinary if not default
    if (user.profileImage && !user.profileImage.includes('default-avatar')) {
      try {
        const publicId = user.profileImage.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`seasoul/profiles/${publicId}`);
        console.log('✅ Old image deleted from Cloudinary');
      } catch (err) {
        console.log('⚠️ Could not delete old image:', err.message);
      }
    }

    user.profileImage = imageUrl;
    await user.save();

    await createNotification(
      userId,
      '🖼️ Profile Photo Updated',
      'Your profile photo has been updated successfully!',
      'profile',
      null,
      imageUrl,
      { action: 'photo_upload' }
    );
    console.log('✅ Profile photo notification created');

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      profileImage: imageUrl,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('❌ Error in uploadProfileImage:', error);
    console.error('❌ Error details:', error.message);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
      error: error.message
    });
  }
};

// ✅ Delete Profile Image
exports.deleteProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.profileImage && !user.profileImage.includes('default-avatar')) {
      try {
        const publicId = user.profileImage.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`seasoul/profiles/${publicId}`);
        console.log('✅ Old image deleted from Cloudinary');
      } catch (err) {
        console.log('⚠️ Could not delete old image:', err.message);
      }
    }

    user.profileImage = 'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png';
    await user.save();

    await createNotification(
      userId,
      '🖼️ Profile Photo Removed',
      'Your profile photo has been removed.',
      'profile',
      null,
      null,
      { action: 'photo_removed' }
    );
    console.log('✅ Profile photo removal notification created');

    res.status(200).json({
      success: true,
      message: 'Profile image removed',
      profileImage: user.profileImage
    });
  } catch (error) {
    console.error('Error in deleteProfileImage:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};