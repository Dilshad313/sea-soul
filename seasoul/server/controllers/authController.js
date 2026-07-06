const User = require('../models/User');
const jwt = require('jsonwebtoken');
const OTP = require('../models/OTP');
const nodemailer = require('nodemailer');
require('dotenv').config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// ==================== FORGOT PASSWORD (Send OTP to Email) ====================

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

    // Generate OTP for password reset (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save OTP to user
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = otpExpiry;
    await user.save();

    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'SeaSoul - Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0D1516; color: #DCE4E5; border-radius: 10px;">
          <div style="text-align: center; padding: 20px 0;">
            <h1 style="color: #00E5FF; font-size: 32px;">🌊 SeaSoul</h1>
            <p style="color: #BAC9CC; font-size: 14px;">LUXURIOUS ISLAND GETAWAYS</p>
          </div>
          <div style="background-color: #1A2B49; padding: 30px; border-radius: 10px;">
            <h2 style="color: #FFFFFF; text-align: center;">Password Reset OTP</h2>
            <p style="color: #BAC9CC; text-align: center; font-size: 16px;">
              Use the following OTP to reset your password:
            </p>
            <div style="text-align: center; padding: 20px 0;">
              <span style="display: inline-block; background-color: #0D1516; color: #00E5FF; font-size: 36px; font-weight: bold; padding: 15px 40px; border-radius: 8px; letter-spacing: 8px; border: 1px solid #00E5FF;">
                ${otp}
              </span>
            </div>
            <p style="color: #849396; text-align: center; font-size: 14px;">
              This OTP is valid for 10 minutes.
            </p>
            <p style="color: #849396; text-align: center; font-size: 12px; margin-top: 20px;">
              If you didn't request this, please ignore this email.
            </p>
          </div>
          <div style="text-align: center; padding: 20px 0; color: #849396; font-size: 12px;">
            <p>© 2024 SeaSoul Holidays. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

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

// ==================== VERIFY OTP AND RESET PASSWORD ====================

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

    // Update password
    user.password = newPassword;
    user.resetPasswordOTP = null;
    user.resetPasswordExpires = null;
    await user.save();

    // Send confirmation email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'SeaSoul - Password Changed Successfully',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0D1516; color: #DCE4E5; border-radius: 10px;">
          <div style="text-align: center; padding: 20px 0;">
            <h1 style="color: #00E5FF; font-size: 32px;">🌊 SeaSoul</h1>
            <p style="color: #BAC9CC; font-size: 14px;">LUXURIOUS ISLAND GETAWAYS</p>
          </div>
          <div style="background-color: #1A2B49; padding: 30px; border-radius: 10px;">
            <h2 style="color: #00E5FF; text-align: center;">✅ Password Changed Successfully</h2>
            <p style="color: #BAC9CC; text-align: center; font-size: 16px;">
              Your SeaSoul account password has been changed successfully.
            </p>
            <p style="color: #849396; text-align: center; font-size: 14px; margin-top: 20px;">
              If you didn't make this change, please contact support immediately.
            </p>
          </div>
          <div style="text-align: center; padding: 20px 0; color: #849396; font-size: 12px;">
            <p>© 2024 SeaSoul Holidays. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
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

// ==================== CHANGE PASSWORD (Logged In User) ====================

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

    // Verify current password
    const isPasswordMatch = await user.comparePassword(currentPassword);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Send confirmation email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'SeaSoul - Password Changed Successfully',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0D1516; color: #DCE4E5; border-radius: 10px;">
          <div style="text-align: center; padding: 20px 0;">
            <h1 style="color: #00E5FF; font-size: 32px;">🌊 SeaSoul</h1>
            <p style="color: #BAC9CC; font-size: 14px;">LUXURIOUS ISLAND GETAWAYS</p>
          </div>
          <div style="background-color: #1A2B49; padding: 30px; border-radius: 10px;">
            <h2 style="color: #00E5FF; text-align: center;">✅ Password Changed Successfully</h2>
            <p style="color: #BAC9CC; text-align: center; font-size: 16px;">
              Your SeaSoul account password has been changed successfully.
            </p>
            <p style="color: #849396; text-align: center; font-size: 14px; margin-top: 20px;">
              If you didn't make this change, please contact support immediately.
            </p>
          </div>
          <div style="text-align: center; padding: 20px 0; color: #849396; font-size: 12px;">
            <p>© 2024 SeaSoul Holidays. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
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

    // ✅ CHECK: Email already registered? (NEW)
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('❌ Email already registered:', email);
      return res.status(400).json({
        success: false,
        message: 'This email is already registered. Please login or use another email.'
      });
    }

    // ✅ CHECK: Phone already registered? (NEW)
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

    // Find user by email OR phone
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