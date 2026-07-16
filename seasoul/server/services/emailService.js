// services/emailService.js - Update with password reset function
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// ✅ Send Password Reset OTP Email (Notification only - OTP sent via SMS)
const sendPasswordResetOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: '🔐 SeaSoul - Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0D1516; color: #DCE4E5; border-radius: 10px;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #00E5FF; font-size: 32px; margin: 0;">🌊 SeaSoul</h1>
          <p style="color: #BAC9CC; font-size: 14px; margin: 0;">LUXURIOUS ISLAND GETAWAYS</p>
        </div>
        <div style="background-color: #1A2B49; padding: 30px; border-radius: 10px;">
          <h2 style="color: #FFFFFF; text-align: center;">Password Reset Request</h2>
          <p style="color: #BAC9CC; text-align: center; font-size: 16px;">
            We received a request to reset your SeaSoul account password.
          </p>
          <div style="text-align: center; padding: 20px 0;">
            <p style="color: #BAC9CC; font-size: 14px;">
              A <strong>4-digit OTP</strong> has been sent to your registered phone number.
            </p>
            <div style="background-color: #0D1516; padding: 15px; border-radius: 8px; display: inline-block; border: 1px solid #00E5FF;">
              <p style="color: #00E5FF; font-size: 20px; font-weight: bold; margin: 0; letter-spacing: 4px;">
                📱 Check SMS
              </p>
            </div>
          </div>
          <p style="color: #849396; text-align: center; font-size: 14px; margin-top: 20px;">
            If you didn't request this, please ignore this email.
          </p>
          <p style="color: #849396; text-align: center; font-size: 12px;">
            Your OTP is valid for 10 minutes.
          </p>
        </div>
        <div style="text-align: center; padding: 20px 0; color: #849396; font-size: 12px; border-top: 1px solid #1A2B49; margin-top: 20px;">
          <p>© 2024 SeaSoul Holidays. All rights reserved.</p>
          <p>Need help? Contact us at support@seasoul.com</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Password reset OTP email sent to:', email);
  } catch (error) {
    console.error('❌ Email send error:', error);
  }
};

// ✅ Send Password Changed Email
const sendPasswordChangedEmail = async (email) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: '✅ SeaSoul - Password Changed Successfully',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0D1516; color: #DCE4E5; border-radius: 10px;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #00E5FF; font-size: 32px; margin: 0;">🌊 SeaSoul</h1>
          <p style="color: #BAC9CC; font-size: 14px; margin: 0;">LUXURIOUS ISLAND GETAWAYS</p>
        </div>
        <div style="background-color: #1A2B49; padding: 30px; border-radius: 10px;">
          <h2 style="color: #00E5FF; text-align: center;">✅ Password Changed Successfully</h2>
          <p style="color: #BAC9CC; text-align: center; font-size: 16px;">
            Your SeaSoul account password has been changed successfully.
          </p>
          <p style="color: #849396; text-align: center; font-size: 14px; margin-top: 20px;">
            If you didn't make this change, please contact support immediately.
          </p>
        </div>
        <div style="text-align: center; padding: 20px 0; color: #849396; font-size: 12px; border-top: 1px solid #1A2B49; margin-top: 20px;">
          <p>© 2024 SeaSoul Holidays. All rights reserved.</p>
          <p>Need help? Contact us at support@seasoul.com</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Password changed email sent to:', email);
  } catch (error) {
    console.error('❌ Email send error:', error);
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
          <h1 style="color: #00E5FF; font-size: 32px; margin: 0;">🌊 SeaSoul</h1>
          <p style="color: #BAC9CC; font-size: 14px; margin: 0;">LUXURIOUS ISLAND GETAWAYS</p>
        </div>
        <div style="background-color: #1A2B49; padding: 30px; border-radius: 10px;">
          <h2 style="color: #00E5FF; text-align: center;">👋 Welcome, ${user.fullName || 'Guest'}!</h2>
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
        <div style="text-align: center; padding: 20px 0; color: #849396; font-size: 12px; border-top: 1px solid #1A2B49; margin-top: 20px;">
          <p>© 2024 SeaSoul Holidays. All rights reserved.</p>
          <p>Need help? Contact us at support@seasoul.com</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent to:', user.email);
  } catch (error) {
    console.error('❌ Email send error:', error);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetOTPEmail,
  sendPasswordChangedEmail,
};