const OTP = require('../models/OTP');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateOTP = () => {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  console.log('Generated OTP:', otp);
  return otp;
};

const getOTPExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000);
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    console.log('========================================');
    console.log('📞 Received phone number:', phone);
    console.log('========================================');

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    await OTP.deleteMany({ phone });

    const otp = generateOTP();
    const expiresAt = getOTPExpiry();

    console.log('========================================');
    console.log('✅ OTP Generated Successfully!');
    console.log(`📱 Phone: ${phone}`);
    console.log(`🔑 OTP: ${otp}`);
    console.log(`⏰ Expires At: ${expiresAt}`);
    console.log('========================================');

    await OTP.create({
      phone,
      otp,
      expiresAt,
      verified: false,
    });

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      otp: otp,
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

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    const otpRecord = await OTP.findOne({ phone, otp, verified: false });

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
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    const otpRecord = await OTP.findOne({ phone, verified: true });
    if (!otpRecord) {
      console.log('❌ Phone not verified');
      return res.status(400).json({ message: 'Phone number not verified. Please verify OTP first.' });
    }

    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
      console.log('❌ User already exists');
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      fullName,
      email,
      phone,
      password,
    });

    await OTP.deleteOne({ _id: otpRecord._id });

    console.log('✅ User Registered Successfully!');
    console.log(`🆔 User ID: ${user._id}`);

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('❌ Error in register:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};