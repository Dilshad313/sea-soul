const OTP = require('../models/OTP');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../services/emailService');
const smsService = require('../services/smsService');
require('dotenv').config();

const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log('Generated OTP:', otp);
  return otp;
};

const getOTPExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000);
};

// ✅ Format phone number to 10 digits
const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  let cleanPhone = phone.replace(/\s/g, '');
  
  // Remove + if present
  if (cleanPhone.startsWith('+')) {
    cleanPhone = cleanPhone.substring(1);
  }
  
  // If 10 digits, add 91
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }
  // If 11 digits and starts with 0
  else if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
    cleanPhone = '91' + cleanPhone.substring(1);
  }
  // If 12 digits and already has 91
  else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
    // Keep as is
  }
  // If 13 digits (with country code)
  else if (cleanPhone.length === 13) {
    // Keep as is
  }
  
  console.log(`📱 Formatted Phone: ${cleanPhone}`);
  return cleanPhone;
};

// ✅ Send OTP to Email and SMS
exports.sendOTP = async (req, res) => {
  try {
    const { email, phone } = req.body;

    console.log('========================================');
    console.log('📧 Send OTP Request');
    console.log(`📧 Email: ${email}`);
    console.log(`📱 Phone: ${phone}`);
    console.log('========================================');

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Email or Phone is required'
      });
    }

    // ✅ Validate email
    if (email) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid email address'
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'This email is already registered. Please login or use another email.'
        });
      }
    }

    // ✅ Validate and format phone
    let cleanPhone = '';
    if (phone) {
      const phoneRegex = /^[0-9]{10}$/;
      cleanPhone = formatPhoneNumber(phone);
      
      // Extract 10 digits for validation
      let phoneDigits = cleanPhone;
      if (phoneDigits.startsWith('91')) {
        phoneDigits = phoneDigits.substring(2);
      }
      if (phoneDigits.startsWith('0')) {
        phoneDigits = phoneDigits.substring(1);
      }
      
      if (!phoneRegex.test(phoneDigits)) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid 10-digit phone number'
        });
      }

      // Check if phone already registered
      const existingUser = await User.findOne({ phone: cleanPhone });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'This phone number is already registered. Please login or use another.'
        });
      }
    }

    // ✅ Delete old OTPs
    if (email) {
      await OTP.deleteMany({ email });
    }
    if (phone) {
      await OTP.deleteMany({ phone: cleanPhone });
    }

    const otp = generateOTP();
    const expiresAt = getOTPExpiry();

    console.log('✅ OTP Generated Successfully!');
    console.log(`🔑 OTP: ${otp}`);

    // ✅ Save OTP to database
    await OTP.create({
      email: email || '',
      phone: cleanPhone || '',
      otp,
      expiresAt,
      verified: false,
    });

    // ✅ Send OTP via Email
    let emailSent = false;
    if (email) {
      try {
        await sendOTPEmail(email, otp);
        emailSent = true;
        console.log('✅ OTP email sent successfully');
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError);
      }
    }

    // ✅ Send OTP via SMS (MSG91)
    let smsSent = false;
    if (cleanPhone) {
      try {
        const smsResult = await smsService.sendOTP(cleanPhone, otp);
        if (smsResult.success) {
          smsSent = true;
          console.log('✅ OTP SMS sent successfully');
        } else {
          console.error('❌ SMS sending failed:', smsResult.error);
        }
      } catch (smsError) {
        console.error('❌ SMS sending error:', smsError);
      }
    }

    // ✅ Response message based on what was sent
    let message = '';
    if (emailSent && smsSent) {
      message = 'OTP sent successfully to your email and phone';
    } else if (emailSent) {
      message = 'OTP sent successfully to your email (SMS failed)';
    } else if (smsSent) {
      message = 'OTP sent successfully to your phone (Email failed)';
    } else {
      message = 'Failed to send OTP. Please try again.';
      return res.status(500).json({
        success: false,
        message: message,
        emailSent: emailSent,
        smsSent: smsSent,
      });
    }

    res.status(200).json({
      success: true,
      message: message,
      emailSent: emailSent,
      smsSent: smsSent,
      phone: cleanPhone,
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

// ✅ Verify OTP (supports both email and phone)
exports.verifyOTP = async (req, res) => {
  try {
    const { email, phone, otp } = req.body;

    console.log('========================================');
    console.log('🔍 Verifying OTP');
    console.log(`📧 Email: ${email}`);
    console.log(`📱 Phone: ${phone}`);
    console.log(`🔑 OTP: ${otp}`);
    console.log('========================================');

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'OTP is required'
      });
    }

    // ✅ Format phone if provided
    let cleanPhone = phone ? formatPhoneNumber(phone) : '';

    // ✅ Find OTP by email or phone
    let query = {};
    if (email) query.email = email;
    if (cleanPhone) query.phone = cleanPhone;
    query.verified = false;

    const otpRecord = await OTP.findOne(query);

    if (!otpRecord) {
      console.log('❌ Invalid OTP or already verified');
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP or OTP already verified'
      });
    }

    if (otpRecord.otp !== otp) {
      console.log('❌ Invalid OTP');
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
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
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Email or Phone is required'
      });
    }

    // ✅ Format phone if provided
    let cleanPhone = phone ? formatPhoneNumber(phone) : '';

    // ✅ Delete old OTPs
    if (email) {
      await OTP.deleteMany({ email });
    }
    if (cleanPhone) {
      await OTP.deleteMany({ phone: cleanPhone });
    }

    const otp = generateOTP();
    const expiresAt = getOTPExpiry();

    await OTP.create({
      email: email || '',
      phone: cleanPhone || '',
      otp,
      expiresAt,
      verified: false,
    });

    // ✅ Send OTP via Email
    let emailSent = false;
    if (email) {
      try {
        await sendOTPEmail(email, otp);
        emailSent = true;
        console.log('✅ OTP email resent successfully');
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError);
      }
    }

    // ✅ Send OTP via SMS
    let smsSent = false;
    if (cleanPhone) {
      try {
        const smsResult = await smsService.sendOTP(cleanPhone, otp);
        if (smsResult.success) {
          smsSent = true;
          console.log('✅ OTP SMS resent successfully');
        } else {
          console.error('❌ SMS sending failed:', smsResult.error);
        }
      } catch (smsError) {
        console.error('❌ SMS sending error:', smsError);
      }
    }

    console.log('✅ OTP Resent Successfully');

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
      emailSent: emailSent,
      smsSent: smsSent,
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