const User = require('../models/User');
const jwt = require('jsonwebtoken');
const OTP = require('../models/OTP');
// ✅ Import email service
const { 
  sendPasswordResetOTPEmail, 
  sendPasswordChangedEmail 
} = require('../services/emailService');
require('dotenv').config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ==================== FORGOT PASSWORD ====================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    console.log('========================================');
    console.log('🔑 Forgot Password Request');
    console.log(`📧 Email: ${email}`);
    console.log('========================================');

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email'
      });
    }

    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = otpExpiry;
    await user.save();

    // ✅ Send OTP email using email service
    await sendPasswordResetOTPEmail(email, otp);

    console.log('✅ Password reset OTP sent to:', email);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email'
    });
  } catch (error) {
    console.error('❌ Error in forgotPassword:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ==================== RESET PASSWORD ====================
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    console.log('========================================');
    console.log('🔑 Reset Password Request');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 OTP: ${otp}`);
    console.log('========================================');

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    user.password = newPassword;
    user.resetPasswordOTP = null;
    user.resetPasswordExpires = null;
    await user.save();

    // ✅ Send confirmation email using email service
    await sendPasswordChangedEmail(user.email);

    console.log('✅ Password change confirmation email sent to:', user.email);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('❌ Error in resetPassword:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ==================== CHANGE PASSWORD ====================
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    console.log('========================================');
    console.log('🔑 Change Password Request');
    console.log(`👤 User ID: ${userId}`);
    console.log('========================================');

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isPasswordMatch = await user.comparePassword(currentPassword);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    // ✅ Send confirmation email using email service
    await sendPasswordChangedEmail(user.email);

    console.log('✅ Password change confirmation email sent to:', user.email);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('❌ Error in changePassword:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ==================== REGISTER ====================
exports.register = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    console.log('========================================');
    console.log('📝 Registering User');
    console.log(`👤 Name: ${fullName}`);
    console.log(`📧 Email: ${email}`);
    console.log(`📱 Phone: ${phone}`);
    console.log('========================================');

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all fields'
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('❌ Email already registered:', email);
      return res.status(400).json({
        success: false,
        message: 'This email is already registered. Please login or use another email.'
      });
    }

    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      console.log('❌ Phone already registered:', phone);
      return res.status(400).json({
        success: false,
        message: 'This phone number is already registered. Please login or use another number.'
      });
    }

    const otpRecord = await OTP.findOne({ email, verified: true });
    if (!otpRecord) {
      console.log('❌ Email not verified');
      return res.status(400).json({
        success: false,
        message: 'Email not verified. Please verify OTP first.'
      });
    }

    const user = new User({
      fullName,
      email,
      phone,
      password,
    });

    await user.save();
    await OTP.deleteOne({ _id: otpRecord._id });

    console.log('✅ User Registered Successfully!');
    console.log(`🆔 User ID: ${user._id}`);

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage,
      bio: user.bio,
      location: user.location,
      token: token,
    });
  } catch (error) {
    console.error('❌ Error in register:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ==================== LOGIN ====================
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    console.log('========================================');
    console.log('🔐 Login Request');
    console.log(`📧 Identifier: ${identifier}`);
    console.log('========================================');

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide identifier and password'
      });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      console.log('❌ Password mismatch');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id);

    console.log('✅ Login successful!');
    console.log(`👤 User: ${user.fullName} (${user.email})`);

    res.status(200).json({
      success: true,
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage,
      bio: user.bio,
      location: user.location,
      token: token,
    });
  } catch (error) {
    console.error('❌ Error in login:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};