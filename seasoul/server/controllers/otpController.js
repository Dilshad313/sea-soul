// controllers/otpController.js - Complete with Demo Support
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

// ✅ Check if using demo mode
const isDemoNumber = (phone) => {
  const demoNumbers = process.env.MSG91_DEMO_NUMBERS?.split(',') || [];
  // Remove 91 from phone if present
  let cleanPhone = phone;
  if (cleanPhone.startsWith('91')) {
    cleanPhone = cleanPhone.substring(2);
  }
  return demoNumbers.some(num => num.trim() === cleanPhone);
};

// ✅ Send OTP - With Demo Support
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

    // ✅ Check if this is a demo number
    const isDemo = isDemoNumber(phoneDigits);
    
    if (isDemo) {
      console.log('📱 DEMO MODE: Using fixed OTP');
      const demoOTP = process.env.MSG91_DEMO_OTP || '1234';
      console.log(`🔑 Demo OTP: ${demoOTP}`);

      // ✅ Store demo OTP in database
      await OTP.create({
        phone: cleanPhone,
        otp: demoOTP,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        verified: false,
        isDemo: true
      });

      console.log('✅ Demo OTP stored in database');

      return res.status(200).json({
        success: true,
        message: `✅ Demo OTP: ${demoOTP} (Use this to verify)`,
        phone: cleanPhone,
        isDemo: true,
        demoOtp: demoOTP,
        method: 'demo'
      });
    }

    // ✅ Normal OTP send for non-demo numbers
    console.log(`📱 Sending OTP to: ${cleanPhone}`);
    const result = await msg91Service.sendOTP(cleanPhone);
    console.log('📥 MSG91 Result:', result);

    if (!result.success) {
      let errorMsg = 'Failed to send OTP. Please try again.';
      if (result.error && result.error.includes('Invalid')) {
        errorMsg = 'Invalid phone number format.';
      }
      console.error('❌ OTP Send Failed:', result.error);
      return res.status(500).json({
        success: false,
        message: errorMsg,
        error: result.error
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

    console.log('✅ OTP stored in database:', otp);
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

// ✅ Verify OTP - Works with Demo too
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

    // ✅ Check local database
    const otpRecord = await OTP.findOne({
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

    // ✅ If it's a demo OTP, skip MSG91 verification
    if (otpRecord.isDemo) {
      console.log('✅ Demo OTP verified successfully');
      otpRecord.verified = true;
      await otpRecord.save();

      return res.status(200).json({
        success: true,
        message: 'Demo OTP verified successfully',
        verified: true,
        isDemo: true
      });
    }

    // ✅ For normal OTP, verify with MSG91
    try {
      const verifyResult = await msg91Service.verifyOTP(cleanPhone, otp);
      console.log('📥 MSG91 Verify Result:', verifyResult);
      
      if (!verifyResult.success) {
        console.log('⚠️ MSG91 verification failed');
        // Continue anyway since we have local record
      } else {
        console.log('✅ MSG91 also verified the OTP');
      }
    } catch (verifyError) {
      console.log('⚠️ MSG91 verify API error, using local DB:', verifyError.message);
    }

    // ✅ Mark as verified
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
    let phoneDigits = cleanPhone;
    if (phoneDigits.startsWith('91')) {
      phoneDigits = phoneDigits.substring(2);
    }

    // Delete old OTPs
    await OTP.deleteMany({ phone: cleanPhone });

    // ✅ Check if demo
    const isDemo = isDemoNumber(phoneDigits);
    
    if (isDemo) {
      console.log('📱 DEMO MODE: Resending fixed OTP');
      const demoOTP = process.env.MSG91_DEMO_OTP || '1234';

      await OTP.create({
        phone: cleanPhone,
        otp: demoOTP,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        verified: false,
        isDemo: true
      });

      return res.status(200).json({
        success: true,
        message: `✅ Demo OTP: ${demoOTP}`,
        phone: cleanPhone,
        isDemo: true,
        demoOtp: demoOTP
      });
    }

    // ✅ Resend OTP using MSG91
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

    // Store new OTP in database
    const otp = result.otp;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.create({
      phone: cleanPhone,
      otp: otp,
      expiresAt: expiresAt,
      verified: false,
      isDemo: false
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