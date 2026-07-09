const nodemailer = require('nodemailer');
require('dotenv').config();

// ✅ Import email templates
const {
  getWelcomeEmailTemplate,
  getOTPEmailTemplate,
  getPasswordResetOTPEmailTemplate,
  getPasswordChangedEmailTemplate,
  getBookingConfirmationEmailTemplate,
  getPaymentReceiptEmailTemplate,
  getNotificationEmailTemplate,
} = require('../utils/emailTemplates');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// ✅ Send Welcome Email
const sendWelcomeEmail = async (user) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: '🌊 Welcome to SeaSoul Holidays!',
    html: getWelcomeEmailTemplate(user.fullName),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent to:', user.email);
  } catch (error) {
    console.error('❌ Email send error:', error);
  }
};

// ✅ Send OTP Email
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'SeaSoul - Your OTP for Registration',
    html: getOTPEmailTemplate(otp),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent to:', email);
  } catch (error) {
    console.error('❌ Email send error:', error);
  }
};

// ✅ Send Password Reset OTP Email
const sendPasswordResetOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'SeaSoul - Password Reset OTP',
    html: getPasswordResetOTPEmailTemplate(otp),
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
    subject: 'SeaSoul - Password Changed Successfully',
    html: getPasswordChangedEmailTemplate(),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Password changed email sent to:', email);
  } catch (error) {
    console.error('❌ Email send error:', error);
  }
};

// ✅ Send Booking Confirmation Email
const sendBookingConfirmationEmail = async (user, booking, product) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: '✅ Booking Confirmed - SeaSoul Holidays',
    html: getBookingConfirmationEmailTemplate(user.fullName, booking, product),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Booking confirmation email sent to:', user.email);
  } catch (error) {
    console.error('❌ Email send error:', error);
  }
};

// ✅ Send Payment Receipt Email
const sendPaymentReceiptEmail = async (user, payment, booking, product) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: '💰 Payment Receipt - SeaSoul Holidays',
    html: getPaymentReceiptEmailTemplate(user.fullName, payment, booking, product),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Payment receipt email sent to:', user.email);
  } catch (error) {
    console.error('❌ Email send error:', error);
  }
};

// ✅ Send Notification Email
const sendNotificationEmail = async (user, title, message) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `📢 ${title} - SeaSoul Holidays`,
    html: getNotificationEmailTemplate(title, message),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Notification email sent to:', user.email);
  } catch (error) {
    console.error('❌ Email send error:', error);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendOTPEmail,
  sendPasswordResetOTPEmail,
  sendPasswordChangedEmail,
  sendBookingConfirmationEmail,
  sendPaymentReceiptEmail,
  sendNotificationEmail,
};