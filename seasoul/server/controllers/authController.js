const User = require('../models/User');
const jwt = require('jsonwebtoken');
const OTP = require('../models/OTP');
require('dotenv').config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
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
      return res.status(400).json({ 
        success: false,
        message: 'Please fill all fields' 
      });
    }

    const otpRecord = await OTP.findOne({ phone, verified: true });
    if (!otpRecord) {
      console.log('❌ Phone not verified');
      return res.status(400).json({ 
        success: false,
        message: 'Phone number not verified. Please verify OTP first.' 
      });
    }

    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
      console.log('❌ User already exists');
      return res.status(400).json({ 
        success: false,
        message: 'User already exists' 
      });
    }

    const user = new User({
      fullName,
      email,
      phone,
      password,
    });

    await user.save();

    await OTP.deleteOne({ _id: otpRecord._id });

    console.log('✅ User Registered Successfully!');
    console.log(`🆔 User ID: ${user._id}`);

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      token: token,
    });
  } catch (error) {
    console.error('❌ Error in register:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide identifier and password' 
      });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      token: token,
    });
  } catch (error) {
    console.error('❌ Error in login:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};