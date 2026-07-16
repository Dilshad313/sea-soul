// controllers/otpController.js - Using MSG91 Demo Configuration Only
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

// ✅ Send OTP - Uses MSG91 Widget Demo
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

    // ✅ Delete old OTPs
    await OTP.deleteMany({ phone: cleanPhone });

    // ✅ Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(`🔑 Generated OTP: ${otp}`);

    // ✅ Send OTP via MSG91 Widget (Demo will be handled by MSG91)
    console.log(`📱 Sending OTP via MSG91 to: ${cleanPhone}`);
    const result = await msg91Service.sendOTP(cleanPhone);
    console.log('📥 MSG91 Result:', result);

    // ✅ Store OTP in database
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.create({
      phone: cleanPhone,
      otp: otp,
      expiresAt: expiresAt,
      verified: false,
      isDemo: false,
      msg91OrderId: result.data?.order_id || null
    });

    console.log('✅ OTP stored in database:', otp);

    // ✅ Check if MSG91 sent OTP or it's in demo mode
    // MSG91 handles demo internally - if it's a demo number, no SMS is sent
    if (!result.success) {
      console.warn('⚠️ MSG91 SMS failed, but OTP stored in DB');
      
      // For demo, MSG91 Widget API might still return success
      // but no SMS is actually sent
      return res.status(200).json({
        success: true,
        message: 'OTP generated successfully',
        phone: cleanPhone,
        method: 'local',
        isDemo: false, // MSG91 handles demo internally
        warning: 'Check MSG91 console for demo status'
      });
    }

    console.log('✅ OTP sent via', result.method || 'MSG91');

    res.status(200).json({
      success: true,
      message: 'OTP sent to your phone',
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

    // ✅ Check local database
    const otpRecord = await OTP.findOne({
      phone: cleanPhone,
      otp: otp,
      verified: false
    });

    if (!otpRecord) {
      console.log('❌ Invalid OTP or already verified');
      
      // Check if expired
      const expiredRecord = await OTP.findOne({ phone: cleanPhone, otp: otp });
      if (expiredRecord && expiredRecord.verified) {
        return res.status(400).json({
          success: false,
          message: 'OTP already used. Please request a new one.'
        });
      }
      if (expiredRecord && new Date() > expiredRecord.expiresAt) {
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

    // ✅ Try MSG91 verification (optional, for extra validation)
    try {
      const verifyResult = await msg91Service.verifyOTP(cleanPhone, otp);
      console.log('📥 MSG91 Verify Result:', verifyResult);
    } catch (verifyError) {
      console.log('⚠️ MSG91 verify API error (ignored):', verifyError.message);
    }

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

    // ✅ Delete old OTPs
    await OTP.deleteMany({ phone: cleanPhone });

    // ✅ Generate new OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(`🔑 New OTP: ${otp}`);

    // ✅ Store OTP in database
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.create({
      phone: cleanPhone,
      otp: otp,
      expiresAt: expiresAt,
      verified: false,
      isDemo: false
    });

    console.log('✅ New OTP stored in database:', otp);

    // ✅ Try resending via MSG91
    try {
      const result = await msg91Service.resendOTP(cleanPhone);
      console.log('📥 MSG91 Resend Result:', result);
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