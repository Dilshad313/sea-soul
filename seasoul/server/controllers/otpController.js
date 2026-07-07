const OTP = require('../models/OTP');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
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

// Nodemailer Transporter - ഇങ്ങനെ ഉപയോഗിക്കുക
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'SeaSoul - Your OTP for Registration',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0D1516; color: #DCE4E5; border-radius: 10px;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #00E5FF; font-size: 32px;">🌊 SeaSoul</h1>
          <p style="color: #BAC9CC; font-size: 14px;">LUXURIOUS ISLAND GETAWAYS</p>
        </div>
        <div style="background-color: #1A2B49; padding: 30px; border-radius: 10px;">
          <h2 style="color: #FFFFFF; text-align: center;">Verify Your Email</h2>
          <p style="color: #BAC9CC; text-align: center; font-size: 16px;">
            Thank you for choosing SeaSoul. Use the following OTP to complete your registration:
          </p>
          <div style="text-align: center; padding: 20px 0;">
            <span style="display: inline-block; background-color: #0D1516; color: #00E5FF; font-size: 36px; font-weight: bold; padding: 15px 40px; border-radius: 8px; letter-spacing: 8px; border: 1px solid #00E5FF;">
              ${otp}
            </span>
          </div>
          <p style="color: #849396; text-align: center; font-size: 14px;">
            This OTP is valid for 10 minutes.
          </p>
          <p style="color: #849396; text-align: center; font-size: 12px; margin-top: 20px;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
        <div style="text-align: center; padding: 20px 0; color: #849396; font-size: 12px;">
          <p>© 2024 SeaSoul Holidays. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully to:', email);
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

// Send OTP to Email
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    console.log('========================================');
    console.log('📧 Send OTP Request');
    console.log(`📧 Email: ${email}`);
    console.log('========================================');

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Email is required' 
      });
    }

    // ✅ CHECK: Valid email format using regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format:', email);
      return res.status(400).json({ 
        success: false,
        message: 'Please enter a valid email address (e.g., name@domain.com)' 
      });
    }

    // ✅ CHECK: Email already registered?
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ Email already registered:', email);
      return res.status(400).json({ 
        success: false,
        message: 'This email is already registered. Please login or use another email.' 
      });
    }

    // Delete old OTPs
    await OTP.deleteMany({ email });

    const otp = generateOTP();
    const expiresAt = getOTPExpiry();

    console.log('✅ OTP Generated Successfully!');
    console.log(`🔑 OTP: ${otp}`);
    console.log(`⏰ Expires At: ${expiresAt}`);

    await OTP.create({
      email,
      otp,
      expiresAt,
      verified: false,
    });

    // Send email
    try {
      await sendOTPEmail(email, otp);
      console.log('✅ OTP email sent successfully');
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email',
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

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log('========================================');
    console.log('🔍 Verifying OTP');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 OTP: ${otp}`);
    console.log('========================================');

    if (!email || !otp) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and OTP are required' 
      });
    }

    const otpRecord = await OTP.findOne({ email, otp, verified: false });

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

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Email is required' 
      });
    }

    await OTP.deleteMany({ email });

    const otp = generateOTP();
    const expiresAt = getOTPExpiry();

    await OTP.create({
      email,
      otp,
      expiresAt,
      verified: false,
    });

    await sendOTPEmail(email, otp);

    console.log('✅ OTP Resent Successfully to:', email);

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully to your email',
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

// Register User
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

    const otpRecord = await OTP.findOne({ email, verified: true });
    if (!otpRecord) {
      console.log('❌ Email not verified');
      return res.status(400).json({ 
        success: false,
        message: 'Email not verified. Please verify OTP first.' 
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