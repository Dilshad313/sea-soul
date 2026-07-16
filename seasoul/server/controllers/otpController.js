// controllers/otpController.js
const OTP = require('../models/OTP');
const User = require('../models/User');
const msg91Service = require('../services/msg91Service');
require('dotenv').config();

const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  let cleanPhone = phone.replace(/\s/g, '');
  
  if (cleanPhone.startsWith('+')) {
    cleanPhone = cleanPhone.substring(1);
  }
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  } else if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
    cleanPhone = '91' + cleanPhone.substring(1);
  }
  
  return cleanPhone;
};

exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    console.log('========================================');
    console.log('📧 Send OTP Request');
    console.log(`📱 Phone: ${phone}`);
    console.log('========================================');

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    const cleanPhone = formatPhoneNumber(phone);
    const phoneRegex = /^[0-9]{10}$/;
    
    let phoneDigits = cleanPhone;
    if (phoneDigits.startsWith('91')) {
      phoneDigits = phoneDigits.substring(2);
    }
    
    if (!phoneRegex.test(phoneDigits)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit phone number'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ phone: cleanPhone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This phone number is already registered. Please login or use another.'
      });
    }

    // ✅ Delete old OTPs
    await OTP.deleteMany({ phone: cleanPhone });

    // ✅ Send OTP via Direct SMS
    console.log(`📱 Sending OTP to: ${cleanPhone}`);
    const result = await msg91Service.sendOTP(cleanPhone);
    console.log('📥 MSG91 Result:', result);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to send OTP. Please try again.'
      });
    }

    // ✅ Store OTP in database
    const otp = result.otp;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.create({
      phone: cleanPhone,
      otp: otp,
      expiresAt: expiresAt,
      verified: false,
      isDemo: false
    });

    console.log(`✅ OTP stored in database: ${otp}`);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your phone',
      phone: cleanPhone,
      method: result.method || 'direct'
    });

  } catch (error) {
    console.error('❌ Error in sendOTP:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    console.log('========================================');
    console.log('🔍 Verifying OTP');
    console.log(`📱 Phone: ${phone}`);
    console.log(`🔑 OTP: ${otp}`);
    console.log('========================================');

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'OTP is required'
      });
    }

    const cleanPhone = formatPhoneNumber(phone);

    // ✅ Check database
    const otpRecord = await OTP.findOne({
      phone: cleanPhone,
      otp: otp,
      verified: false
    });

    if (!otpRecord) {
      console.log('❌ Invalid OTP');
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please check and try again.'
      });
    }

    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      console.log('❌ OTP Expired');
      return res.status(400).json({
        success: false,
        message: 'OTP expired. Please request a new one.'
      });
    }

    // ✅ Mark as verified
    otpRecord.verified = true;
    await otpRecord.save();

    console.log('✅ OTP Verified Successfully!');

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      verified: true
    });

  } catch (error) {
    console.error('❌ Error in verifyOTP:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    const cleanPhone = formatPhoneNumber(phone);

    // ✅ Delete old OTPs
    await OTP.deleteMany({ phone: cleanPhone });

    // ✅ Resend OTP
    const result = await msg91Service.resendOTP(cleanPhone);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to resend OTP. Please try again.'
      });
    }

    const otp = result.otp;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.create({
      phone: cleanPhone,
      otp: otp,
      expiresAt: expiresAt,
      verified: false,
      isDemo: false
    });

    console.log(`✅ OTP resent: ${otp}`);

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
      phone: cleanPhone
    });

  } catch (error) {
    console.error('❌ Error in resendOTP:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};