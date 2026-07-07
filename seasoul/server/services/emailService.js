const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// Send Booking Confirmation Email
const sendBookingConfirmationEmail = async (user, booking, product) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `✅ Booking Confirmed - SeaSoul Holidays`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0D1516; color: #DCE4E5; border-radius: 10px;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #00E5FF; font-size: 32px;">🌊 SeaSoul</h1>
          <p style="color: #BAC9CC; font-size: 14px;">LUXURIOUS ISLAND GETAWAYS</p>
        </div>
        <div style="background-color: #1A2B49; padding: 30px; border-radius: 10px;">
          <h2 style="color: #00E5FF; text-align: center;">✅ Booking Confirmed!</h2>
          <p style="color: #BAC9CC; text-align: center; font-size: 16px;">
            Dear ${user.fullName},
          </p>
          <p style="color: #BAC9CC; font-size: 14px; line-height: 1.8;">
            Your booking has been confirmed successfully!
          </p>
          <div style="background-color: #0D1516; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #00E5FF;">Booking Details</h3>
            <p style="color: #BAC9CC;"><strong>Booking ID:</strong> #${booking._id}</p>
            <p style="color: #BAC9CC;"><strong>Package:</strong> ${product?.name || 'N/A'}</p>
            <p style="color: #BAC9CC;"><strong>Location:</strong> ${product?.location || 'N/A'}</p>
            <p style="color: #BAC9CC;"><strong>Amount:</strong> ₹${booking.totalAmount || 0}</p>
            <p style="color: #BAC9CC;"><strong>Status:</strong> ${booking.status || 'Confirmed'}</p>
            <p style="color: #BAC9CC;"><strong>Date:</strong> ${new Date(booking.createdAt).toLocaleDateString()}</p>
          </div>
          <p style="color: #849396; text-align: center; font-size: 14px;">
            We look forward to welcoming you to paradise!
          </p>
        </div>
        <div style="text-align: center; padding: 20px 0; color: #849396; font-size: 12px;">
          <p>© 2024 SeaSoul Holidays. All rights reserved.</p>
          <p>Need help? Contact us at support@seasoul.com</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Booking confirmation email sent to:', user.email);
  } catch (error) {
    console.error('❌ Email send error:', error);
  }
};

// Send Payment Success Email with Receipt
const sendPaymentReceiptEmail = async (user, payment, booking, product) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `💰 Payment Receipt - SeaSoul Holidays`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0D1516; color: #DCE4E5; border-radius: 10px;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #00E5FF; font-size: 32px;">🌊 SeaSoul</h1>
          <p style="color: #BAC9CC; font-size: 14px;">LUXURIOUS ISLAND GETAWAYS</p>
        </div>
        <div style="background-color: #1A2B49; padding: 30px; border-radius: 10px;">
          <h2 style="color: #00E5FF; text-align: center;">💰 Payment Successful!</h2>
          <p style="color: #BAC9CC; text-align: center; font-size: 16px;">
            Dear ${user.fullName},
          </p>
          <p style="color: #BAC9CC; font-size: 14px; line-height: 1.8;">
            Your payment has been processed successfully. Please find your receipt below.
          </p>
          <div style="background-color: #0D1516; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #00E5FF;">Payment Receipt</h3>
            <p style="color: #BAC9CC;"><strong>Transaction ID:</strong> #${payment._id}</p>
            <p style="color: #BAC9CC;"><strong>Booking ID:</strong> #${booking._id}</p>
            <p style="color: #BAC9CC;"><strong>Package:</strong> ${product?.name || 'N/A'}</p>
            <p style="color: #BAC9CC;"><strong>Amount Paid:</strong> ₹${payment.amount || 0}</p>
            <p style="color: #BAC9CC;"><strong>Payment Method:</strong> ${payment.method || 'Card'}</p>
            <p style="color: #BAC9CC;"><strong>Status:</strong> ${payment.status || 'Completed'}</p>
            <p style="color: #BAC9CC;"><strong>Date:</strong> ${new Date(payment.createdAt).toLocaleDateString()}</p>
            <p style="color: #BAC9CC;"><strong>Time:</strong> ${new Date(payment.createdAt).toLocaleTimeString()}</p>
          </div>
          <div style="background-color: #0D1516; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 3px solid #00E5FF;">
            <p style="color: #00E5FF; font-size: 12px; margin: 0;">📧 This is a system generated receipt. Please keep this for your records.</p>
          </div>
          <p style="color: #849396; text-align: center; font-size: 14px;">
            Thank you for choosing SeaSoul!
          </p>
        </div>
        <div style="text-align: center; padding: 20px 0; color: #849396; font-size: 12px;">
          <p>© 2024 SeaSoul Holidays. All rights reserved.</p>
          <p>Need help? Contact us at support@seasoul.com</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Payment receipt email sent to:', user.email);
  } catch (error) {
    console.error('❌ Email send error:', error);
  }
};

// Send General Notification Email
const sendNotificationEmail = async (user, title, message) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `📢 ${title} - SeaSoul Holidays`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0D1516; color: #DCE4E5; border-radius: 10px;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #00E5FF; font-size: 32px;">🌊 SeaSoul</h1>
          <p style="color: #BAC9CC; font-size: 14px;">LUXURIOUS ISLAND GETAWAYS</p>
        </div>
        <div style="background-color: #1A2B49; padding: 30px; border-radius: 10px;">
          <h2 style="color: #00E5FF; text-align: center;">📢 ${title}</h2>
          <p style="color: #BAC9CC; font-size: 16px; line-height: 1.8;">
            ${message}
          </p>
          <p style="color: #849396; text-align: center; font-size: 14px; margin-top: 20px;">
            Stay updated with SeaSoul!
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
    console.log('✅ Notification email sent to:', user.email);
  } catch (error) {
    console.error('❌ Email send error:', error);
  }
};

module.exports = {
  sendBookingConfirmationEmail,
  sendPaymentReceiptEmail,
  sendNotificationEmail,
};