// controllers/otpController.js - UPDATED

const OTP = require('../models/OTP');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../services/emailService');
const smsService = require('../services/smsService'); // Already using MSG91
require('dotenv').config();

const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log('Generated OTP:', otp);
  return otp;
};

const getOTPExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000);
};

// ✅ Format phone number
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

// ✅ Send OTP - ONLY PHONE (No Email)
exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;  // ✅ Only phone now

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

    // ✅ Validate phone
    let cleanPhone = formatPhoneNumber(phone);
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

    // ✅ Check if user exists (for registration)
    const existingUser = await User.findOne({ phone: cleanPhone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This phone number is already registered. Please login or use another.'
      });
    }

    // ✅ Delete old OTPs
    await OTP.deleteMany({ phone: cleanPhone });

    // ✅ Send OTP via SMS ONLY (Using MSG91)
    console.log(`📱 Sending OTP via MSG91 to: ${cleanPhone}`);
    const smsResult = await smsService.sendOTP(cleanPhone, null);
    console.log('📥 SMS Result:', smsResult);

    if (!smsResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.',
        error: smsResult.error
      });
    }

    // ✅ Store OTP in database for verification
    const otp = smsResult.data?.otp || generateOTP();
    const expiresAt = getOTPExpiry();

    await OTP.create({
      phone: cleanPhone,
      otp: otp,
      expiresAt: expiresAt,
      verified: false,
      msg91OrderId: smsResult.data?.order_id || null
    });

    console.log('✅ OTP SMS sent successfully');

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your phone',
      phone: cleanPhone,
      orderId: smsResult.data?.order_id || null
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

// ✅ Verify OTP - Using MSG91
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

    let cleanPhone = formatPhoneNumber(phone);

    // ✅ First, try MSG91 verification
    const verifyResult = await smsService.verifyOTP(cleanPhone, otp);
    console.log('📥 MSG91 Verify Result:', verifyResult);

    let otpRecord = null;

    if (verifyResult.success) {
      // ✅ MSG91 verification successful
      console.log('✅ MSG91 OTP verification successful');
      
      // Update local OTP record
      otpRecord = await OTP.findOne({ phone: cleanPhone, verified: false });
      if (otpRecord) {
        otpRecord.verified = true;
        await otpRecord.save();
      }
    } else {
      // ✅ Fallback: Check local database
      console.log('⚠️ MSG91 verification failed, checking local DB...');
      
      otpRecord = await OTP.findOne({
        phone: cleanPhone,
        otp: otp,
        verified: false
      });

      if (!otpRecord) {
        console.log('❌ Invalid OTP or already verified');
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP or OTP already verified'
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

      otpRecord.verified = true;
      await otpRecord.save();
    }

    console.log('✅ OTP Verified Successfully!');

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      verified: true,
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

// ✅ Resend OTP - ONLY PHONE
exports.resendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    let cleanPhone = formatPhoneNumber(phone);

    // ✅ Delete old OTPs
    await OTP.deleteMany({ phone: cleanPhone });

    // ✅ Send OTP via SMS
    console.log(`📱 Resending OTP to: ${cleanPhone}`);
    const smsResult = await smsService.sendOTP(cleanPhone, null);

    if (!smsResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to resend OTP. Please try again.',
        error: smsResult.error
      });
    }

    // ✅ Store OTP in database
    const otp = smsResult.data?.otp || generateOTP();
    const expiresAt = getOTPExpiry();

    await OTP.create({
      phone: cleanPhone,
      otp: otp,
      expiresAt: expiresAt,
      verified: false,
      msg91OrderId: smsResult.data?.order_id || null
    });

    console.log('✅ OTP resent successfully');

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
      phone: cleanPhone,
      orderId: smsResult.data?.order_id || null
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

// ✅ For password reset - also only phone
// But keep email for other communications