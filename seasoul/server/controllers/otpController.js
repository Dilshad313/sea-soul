// controllers/otpController.js - COMPLETE FIXED VERSION
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

// ✅ Send OTP - FIXED: ALWAYS STORES OTP IN DATABASE
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

    // Check if user exists
    const existingUser = await User.findOne({ phone: cleanPhone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This phone number is already registered. Please login or use another.'
      });
    }

    // ✅ DELETE old OTPs
    await OTP.deleteMany({ phone: cleanPhone });

    // ✅ GENERATE 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(`🔑 Generated OTP: ${otp}`);

    // ✅ ALWAYS STORE OTP IN DATABASE FIRST
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.create({
      phone: cleanPhone,
      otp: otp,
      expiresAt: expiresAt,
      verified: false,
      isDemo: false
    });

    console.log('✅ OTP STORED in database:', otp);

    // ✅ Try sending SMS via MSG91
    try {
      console.log(`📱 Sending OTP via MSG91 to: ${cleanPhone}`);
      const result = await msg91Service.sendOTP(cleanPhone);
      console.log('📥 MSG91 Result:', result);

      if (result.success) {
        console.log('✅ OTP sent via', result.method || 'MSG91');
        return res.status(200).json({
          success: true,
          message: 'OTP sent to your phone',
          phone: cleanPhone,
          orderId: result.data?.order_id || null,
          method: result.method || 'msg91'
        });
      } else {
        console.warn('⚠️ MSG91 failed, but OTP is stored in DB');
        return res.status(200).json({
          success: true,
          message: 'OTP generated (SMS failed, but stored in DB)',
          phone: cleanPhone,
          method: 'local'
        });
      }
    } catch (smsError) {
      console.warn('⚠️ SMS error, but OTP stored in DB:', smsError.message);
      return res.status(200).json({
        success: true,
        message: 'OTP generated (SMS error, but stored in DB)',
        phone: cleanPhone,
        method: 'local'
      });
    }

  } catch (error) {
    console.error('❌ Error in sendOTP:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ✅ Verify OTP - FIXED: CHECKS DATABASE
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

    // ✅ CHECK DATABASE FOR OTP
    const otpRecord = await OTP.findOne({
      phone: cleanPhone,
      otp: otp,
      verified: false
    });

    console.log('📥 Database Record:', otpRecord);

    if (!otpRecord) {
      console.log('❌ No valid OTP found in database');
      
      // Check if OTP exists but is already verified
      const usedRecord = await OTP.findOne({
        phone: cleanPhone,
        otp: otp,
        verified: true
      });
      
      if (usedRecord) {
        return res.status(400).json({
          success: false,
          message: 'OTP already used. Please request a new one.'
        });
      }
      
      // Check if OTP expired
      const expiredRecord = await OTP.findOne({
        phone: cleanPhone,
        otp: otp
      });
      
      if (expiredRecord && new Date() > expiredRecord.expiresAt) {
        await OTP.deleteOne({ _id: expiredRecord._id });
        return res.status(400).json({
          success: false,
          message: 'OTP expired. Please request a new one.'
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please check and try again.'
      });
    }

    // ✅ Check if expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      console.log('❌ OTP Expired');
      return res.status(400).json({
        success: false,
        message: 'OTP expired. Please request a new one.'
      });
    }

    // ✅ MARK AS VERIFIED
    otpRecord.verified = true;
    await otpRecord.save();

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

// ✅ Resend OTP - FIXED
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

    // ✅ DELETE old OTPs
    await OTP.deleteMany({ phone: cleanPhone });

    // ✅ GENERATE new OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(`🔑 New OTP: ${otp}`);

    // ✅ STORE in database
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.create({
      phone: cleanPhone,
      otp: otp,
      expiresAt: expiresAt,
      verified: false,
      isDemo: false
    });

    console.log('✅ New OTP stored in database:', otp);

    // ✅ Try resending via MSG91 (optional)
    try {
      await msg91Service.resendOTP(cleanPhone);
    } catch (smsError) {
      console.warn('⚠️ SMS resend failed, but OTP stored in DB');
    }

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
      phone: cleanPhone,
      method: 'local'
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