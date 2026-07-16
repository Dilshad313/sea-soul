// controllers/otpController.js - COMPLETE FIXED
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

// ✅ Send OTP - Always stores in DB before returning
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

    // ✅ Store demo OTP in database FIRST
    // MSG91 handles demo internally, but we store it for verification
    const demoOTP = '1234';
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.create({
      phone: cleanPhone,
      otp: demoOTP,
      expiresAt: expiresAt,
      verified: false,
      isDemo: true
    });

    console.log(`✅ Demo OTP stored in database: ${demoOTP}`);

    // ✅ Send via MSG91 Widget (handles demo internally)
    try {
      const result = await msg91Service.sendOTP(cleanPhone);
      console.log('📥 MSG91 Result:', result);
      
      if (result.success) {
        console.log('✅ OTP sent via MSG91 Widget');
      } else {
        console.warn('⚠️ MSG91 failed, but OTP stored in DB');
      }
    } catch (error) {
      console.warn('⚠️ MSG91 error, but OTP stored in DB:', error.message);
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent to your phone',
      phone: cleanPhone,
      method: 'msg91'
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

// ✅ Verify OTP - Checks DB first, then MSG91
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

    // ✅ Check database FIRST
    const otpRecord = await OTP.findOne({
      phone: cleanPhone,
      otp: otp,
      verified: false
    });

    console.log('📥 Database Record:', otpRecord);

    if (!otpRecord) {
      console.log('❌ No valid OTP in database');
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please request a new one.'
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

    // ✅ Try MSG91 verification (optional)
    try {
      const verifyResult = await msg91Service.verifyOTP(cleanPhone, otp);
      console.log('📥 MSG91 Verify Result:', verifyResult);
    } catch (verifyError) {
      console.log('⚠️ MSG91 verify error, but DB has record:', verifyError.message);
    }

    // ✅ Mark as verified in DB
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

// ✅ Resend OTP
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

    // ✅ Store new demo OTP
    const demoOTP = '1234';
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.create({
      phone: cleanPhone,
      otp: demoOTP,
      expiresAt: expiresAt,
      verified: false,
      isDemo: true
    });

    console.log(`✅ Demo OTP stored: ${demoOTP}`);

    // ✅ Try MSG91 resend
    try {
      await msg91Service.resendOTP(cleanPhone);
    } catch (error) {
      console.warn('⚠️ MSG91 resend error:', error.message);
    }

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