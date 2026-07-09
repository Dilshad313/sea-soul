const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');
require('dotenv').config();

// ✅ Initialize Google OAuth Client
const googleClient = new OAuth2Client(
  process.env.GOOGLE_ANDROID_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

// ✅ Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// ✅ Google Login - Export correctly
const googleLogin = async (req, res) => {
  try {
    const { idToken, platform } = req.body;

    console.log('========================================');
    console.log('🔐 Google Login Request');
    console.log(`📱 Platform: ${platform || 'unknown'}`);
    console.log('========================================');

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'ID Token is required'
      });
    }

    // ✅ Get correct client ID based on platform
    let clientId;
    if (platform === 'web') {
      clientId = process.env.GOOGLE_WEB_CLIENT_ID;
    } else {
      clientId = process.env.GOOGLE_ANDROID_CLIENT_ID;
    }

    console.log(`🔑 Using Client ID: ${clientId ? 'Present' : 'Missing'}`);

    if (!clientId) {
      return res.status(500).json({
        success: false,
        message: 'Google Client ID not configured for this platform'
      });
    }

    // ✅ Verify Google ID Token
    const ticket = await googleClient.verifyIdToken({
      idToken: idToken,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload;

    console.log('✅ Google ID Token verified successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Name: ${name}`);

    // ✅ Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      console.log('📝 Creating new user from Google...');

      user = new User({
        fullName: name || 'User',
        email: email,
        phone: '',
        password: '',
        profileImage: picture || '',
        bio: '',
        location: '',
        isGoogleUser: true,
        googleId: sub,
        isActive: true,
      });

      await user.save();
      console.log('✅ New Google user created successfully!');

      // ✅ Send welcome email
      try {
        await sendWelcomeEmail(user);
        console.log('✅ Welcome email sent to:', email);
      } catch (emailError) {
        console.log('⚠️ Failed to send welcome email:', emailError.message);
      }

    } else {
      console.log('📝 Existing user found. Updating Google data...');

      if (!user.isGoogleUser) {
        user.isGoogleUser = true;
        user.googleId = sub;
        if (!user.profileImage && picture) {
          user.profileImage = picture;
        }
        await user.save();
        console.log('✅ Existing user updated with Google data');
      }
    }

    // ✅ Generate JWT Token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log('✅ Google Login successful!');
    console.log(`🆔 User ID: ${user._id}`);

    res.status(200).json({
      success: true,
      token: token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || '',
        profileImage: user.profileImage || '',
        bio: user.bio || '',
        location: user.location || '',
        role: user.role || 'user',
        isGoogleUser: user.isGoogleUser || true,
        isActive: user.isActive !== undefined ? user.isActive : true,
      }
    });

  } catch (error) {
    console.error('❌ Google Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Google authentication failed',
      error: error.message
    });
  }
};

// ✅ Send Welcome Email
const sendWelcomeEmail = async (user) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: '🌊 Welcome to SeaSoul Holidays!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0D1516; color: #DCE4E5; border-radius: 10px;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #00E5FF; font-size: 32px;">🌊 SeaSoul</h1>
          <p style="color: #BAC9CC; font-size: 14px;">LUXURIOUS ISLAND GETAWAYS</p>
        </div>
        <div style="background-color: #1A2B49; padding: 30px; border-radius: 10px;">
          <h2 style="color: #00E5FF; text-align: center;">👋 Welcome, ${user.fullName}!</h2>
          <p style="color: #BAC9CC; text-align: center; font-size: 16px;">
            Thank you for joining SeaSoul Holidays!
          </p>
          <p style="color: #BAC9CC; font-size: 14px; line-height: 1.8;">
            You are now part of our exclusive community of travelers who explore 
            the pristine islands of Lakshadweep.
          </p>
          <div style="background-color: #0D1516; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #00E5FF;">✨ What you can do:</h3>
            <ul style="color: #BAC9CC; list-style: none; padding: 0;">
              <li>🏝️ Explore luxury packages and activities</li>
              <li>📅 Book your dream island getaway</li>
              <li>⭐ Share your experiences with reviews</li>
              <li>❤️ Save your favorite destinations</li>
            </ul>
          </div>
          <p style="color: #849396; text-align: center; font-size: 14px;">
            Start your journey with SeaSoul today!
          </p>
        </div>
        <div style="text-align: center; padding: 20px 0; color: #849396; font-size: 12px;">
          <p>© 2024 SeaSoul Holidays. All rights reserved.</p>
          <p>Need help? Contact us at support@seasoul.com</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ✅ Export correctly
module.exports = {
  googleLogin
};