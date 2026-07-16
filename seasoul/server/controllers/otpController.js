// controllers/otpController.js - Using only msg91Service
const OTP = require('../models/OTP');
const User = require('../models/User');
const msg91Service = require('../services/msg91Service');
require('dotenv').config();

const generateOTP = () => {
  // ✅ 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  console.log('Generated OTP:', otp);
  return otp;
};

const getOTPExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000);
};

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

// ✅ Send OTP - Phone ONLY
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

    // Check if user exists (for registration)
    const existingUser = await User.findOne({ phone: cleanPhone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This phone number is already registered. Please login or use another.'
      });
    }

    // Delete old OTPs
    await OTP.deleteMany({ phone: cleanPhone });

    // ✅ Send OTP using MSG91 Service only
    console.log(`📱 Sending OTP to: ${cleanPhone}`);
    const result = await msg91Service.sendOTP(cleanPhone);
    console.log('📥 MSG91 Result:', result);

    if (!result.success) {
      let errorMsg = 'Failed to send OTP. Please try again.';
      if (result.error && result.error.includes('Invalid')) {
        errorMsg = 'Invalid phone number format.';
      }
      return res.status(500).json({
        success: false,
        message: errorMsg,
        error: result.error
      });
    }

    // ✅ Store OTP in database
    const otp = result.otp || generateOTP();
    const expiresAt = getOTPExpiry();

    await OTP.create({
      phone: cleanPhone,
      otp: otp,
      expiresAt: expiresAt,
      verified: false,
      msg91OrderId: result.data?.order_id || null
    });

    console.log('✅ OTP sent successfully via', result.method || 'MSG91');

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your phone',
      phone: cleanPhone,
      orderId: result.data?.order_id || null,
      method: result.method || 'msg91'
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

// ✅ Verify OTP
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
    let phoneDigits = cleanPhone;
    if (phoneDigits.startsWith('91')) {
      phoneDigits = phoneDigits.substring(2);
    }

    // ✅ Verify using MSG91 Service
    const verifyResult = await msg91Service.verifyOTP(cleanPhone, otp);
    console.log('📥 MSG91 Verify Result:', verifyResult);

    let otpRecord = null;

    if (verifyResult.success) {
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

    let cleanPhone = formatPhoneNumber(phone);

    // Delete old OTPs
    await OTP.deleteMany({ phone: cleanPhone });

    // ✅ Resend OTP using MSG91 Service
    console.log(`📱 Resending OTP to: ${cleanPhone}`);
    const result = await msg91Service.resendOTP(cleanPhone);
    console.log('📥 MSG91 Resend Result:', result);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to resend OTP. Please try again.',
        error: result.error
      });
    }

    // Store OTP in database
    const otp = result.otp || generateOTP();
    const expiresAt = getOTPExpiry();

    await OTP.create({
      phone: cleanPhone,
      otp: otp,
      expiresAt: expiresAt,
      verified: false,
      msg91OrderId: result.data?.order_id || null
    });

    console.log('✅ OTP resent successfully');

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
      phone: cleanPhone,
      orderId: result.data?.order_id || null
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