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

// ✅ Upload Profile Image - FIXED (Accepts both URL and base64)
exports.uploadProfileImage = async (req, res) => {
  try {
    console.log('📤 Profile Upload request received');
    console.log('📤 Request body keys:', Object.keys(req.body));

    const userId = req.user.id;
    let imageUrl = req.body.image || req.body.imageUrl;

    if (!imageUrl) {
      console.log('❌ No image in request');
      return res.status(400).json({
        success: false,
        message: 'No image provided'
      });
    }

    console.log('📤 Image data:', imageUrl.substring(0, 100) + '...');

    // ✅ Check if it's a Cloudinary URL (already uploaded)
    if (imageUrl.startsWith('https://res.cloudinary.com') || 
        imageUrl.startsWith('http://res.cloudinary.com')) {
      console.log('✅ Image is already a Cloudinary URL');
      // Just save the URL directly
    }
    // ✅ Check if it's base64
    else if (imageUrl.startsWith('data:image')) {
      console.log('📤 Uploading base64 image to Cloudinary...');
      const result = await cloudinary.uploader.upload(imageUrl, {
        folder: 'seasoul/profiles',
        width: 500,
        height: 500,
        crop: 'fill',
        gravity: 'face',
        quality: 'auto:good',
      });
      imageUrl = result.secure_url;
      console.log('✅ Cloudinary upload successful:', imageUrl);
    }
    // ✅ Invalid format
    else {
      console.log('❌ Invalid image format');
      return res.status(400).json({
        success: false,
        message: 'Invalid image format. Please provide a Cloudinary URL or base64 image data.'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old image from Cloudinary if not default
    if (user.profileImage && 
        user.profileImage.includes('cloudinary') && 
        !user.profileImage.includes('default-avatar')) {
      try {
        const urlParts = user.profileImage.split('/');
        const versionIndex = urlParts.indexOf('upload') + 2;
        if (versionIndex < urlParts.length) {
          const publicIdWithExt = urlParts.slice(versionIndex).join('/');
          const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
          console.log('📤 Deleting old image:', publicId);
          await cloudinary.uploader.destroy(publicId);
          console.log('✅ Old image deleted');
        }
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

    if (user.profileImage && 
        user.profileImage.includes('cloudinary') && 
        !user.profileImage.includes('default-avatar')) {
      try {
        const urlParts = user.profileImage.split('/');
        const versionIndex = urlParts.indexOf('upload') + 2;
        if (versionIndex < urlParts.length) {
          const publicIdWithExt = urlParts.slice(versionIndex).join('/');
          const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
          console.log('📤 Deleting image:', publicId);
          await cloudinary.uploader.destroy(publicId);
          console.log('✅ Image deleted');
        }
      } catch (err) {
        console.log('⚠️ Could not delete image:', err.message);
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