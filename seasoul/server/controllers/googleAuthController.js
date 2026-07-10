const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
// ✅ Import email service
const { sendWelcomeEmail } = require('../services/emailService');
require('dotenv').config();

// ✅ Initialize Google OAuth Client
const googleClient = new OAuth2Client(
  process.env.GOOGLE_ANDROID_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

// ✅ Google Login
exports.googleLogin = async (req, res) => {
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

    const ticket = await googleClient.verifyIdToken({
      idToken: idToken,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload;

    console.log('✅ Google ID Token verified successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Name: ${name}`);

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

      // ✅ Send welcome email using email service
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