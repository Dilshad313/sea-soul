// controllers/otpController.js - FORCE DEMO MODE

const OTP = require('../models/OTP');
const User = require('../models/User');
require('dotenv').config();

// ✅ List of demo numbers (hardcoded for testing)
const DEMO_NUMBERS = ['8129645054', '9961185847'];
const DEMO_OTP = '1234';

const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  let cleanPhone = phone.replace(/\s/g, '');
  if (cleanPhone.startsWith('+91')) {
    cleanPhone = cleanPhone.substring(3);
  } else if (cleanPhone.startsWith('91')) {
    cleanPhone = cleanPhone.substring(2);
  }
  return cleanPhone;
};

exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    console.log('📧 Send OTP Request:', phone);

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    const cleanPhone = formatPhoneNumber(phone);
    
    // ✅ Check if it's a demo number
    const isDemo = DEMO_NUMBERS.includes(cleanPhone);
    
    if (isDemo) {
      console.log('🔑 DEMO MODE: Using fixed OTP 1234 for:', cleanPhone);
      
      // ✅ Store demo OTP in database
      await OTP.deleteMany({ phone: cleanPhone });
      await OTP.create({
        phone: cleanPhone,
        otp: DEMO_OTP,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        verified: false,
        isDemo: true
      });

      return res.status(200).json({
        success: true,
        message: 'Demo OTP sent! Use 1234',
        phone: cleanPhone,
        isDemo: true,
        demoOtp: DEMO_OTP,
        method: 'demo'
      });
    }

    // ❌ Reject non-demo numbers for testing
    return res.status(400).json({
      success: false,
      message: 'Only demo numbers allowed for testing'
    });

  } catch (error) {
    console.error('❌ Error:', error);
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
    console.log('🔍 Verifying OTP:', phone, otp);

    const cleanPhone = formatPhoneNumber(phone);

    // ✅ Check database for OTP
    const otpRecord = await OTP.findOne({
      phone: cleanPhone,
      otp: otp,
      verified: false
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please check and try again.'
      });
    }

    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
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
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};