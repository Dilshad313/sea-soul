// ✅ Email Templates with SeaSoul Logo

// ✅ Get Logo URL - Using absolute path
const getLogoUrl = () => {
  // Option 1: Using localhost (for development)
  // Make sure server serves assets folder
  return 'http://localhost:5000/assets/images/image.png';
  
  // Option 2: Using Cloudinary (Recommended for production)
  // return 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/seasoul-logo.png';
  
  // Option 3: Using your deployed domain
  // return 'https://seasoul.com/assets/images/image.png';
};

const getEmailHeader = () => {
  const logoUrl = getLogoUrl();
  return `
    <div style="text-align: center; padding: 20px 0;">
      <img 
        src="${logoUrl}" 
        alt="SeaSoul Holidays" 
        style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #00E5FF;"
        onerror="this.style.display='none'; this.parentNode.innerHTML='<h1 style=\\'color: #00E5FF; font-size: 32px; margin: 10px 0 0 0;\\'>🌊 SeaSoul</h1>'"
      />
      <h1 style="color: #00E5FF; font-size: 32px; margin: 10px 0 0 0;">SeaSoul</h1>
      <p style="color: #BAC9CC; font-size: 14px; margin: 0;">LUXURIOUS ISLAND GETAWAYS</p>
    </div>
  `;
};

const getEmailFooter = () => {
  return `
    <div style="text-align: center; padding: 20px 0; color: #849396; font-size: 12px; border-top: 1px solid #1A2B49; margin-top: 20px;">
      <p>© 2024 SeaSoul Holidays. All rights reserved.</p>
      <p>Need help? Contact us at support@seasoul.com</p>
      <p style="margin-top: 10px;">
        <a href="https://seasoul.com" style="color: #00E5FF; text-decoration: none;">Visit Website</a>
      </p>
    </div>
  `;
};

// ✅ Welcome Email Template
const getWelcomeEmailTemplate = (userName) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0D1516; color: #DCE4E5; border-radius: 10px;">
      ${getEmailHeader()}
      <div style="background-color: #1A2B49; padding: 30px; border-radius: 10px;">
        <h2 style="color: #00E5FF; text-align: center;">👋 Welcome, ${userName || 'Guest'}!</h2>
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
      ${getEmailFooter()}
    </div>
  `;
};

// ✅ OTP Email Template
const getOTPEmailTemplate = (otp) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0D1516; color: #DCE4E5; border-radius: 10px;">
      ${getEmailHeader()}
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
      ${getEmailFooter()}
    </div>
  `;
};

// ✅ Password Reset OTP Email Template
const getPasswordResetOTPEmailTemplate = (otp) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0D1516; color: #DCE4E5; border-radius: 10px;">
      ${getEmailHeader()}
      <div style="background-color: #1A2B49; padding: 30px; border-radius: 10px;">
        <h2 style="color: #FFFFFF; text-align: center;">Password Reset OTP</h2>
        <p style="color: #BAC9CC; text-align: center; font-size: 16px;">
          Use the following OTP to reset your password:
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
      ${getEmailFooter()}
    </div>
  `;
};

// ✅ Password Changed Successfully Email Template
const getPasswordChangedEmailTemplate = () => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0D1516; color: #DCE4E5; border-radius: 10px;">
      ${getEmailHeader()}
      <div style="background-color: #1A2B49; padding: 30px; border-radius: 10px;">
        <h2 style="color: #00E5FF; text-align: center;">✅ Password Changed Successfully</h2>
        <p style="color: #BAC9CC; text-align: center; font-size: 16px;">
          Your SeaSoul account password has been changed successfully.
        </p>
        <p style="color: #849396; text-align: center; font-size: 14px; margin-top: 20px;">
          If you didn't make this change, please contact support immediately.
        </p>
      </div>
      ${getEmailFooter()}
    </div>
  `;
};

// ✅ Booking Confirmation Email Template
const getBookingConfirmationEmailTemplate = (userName, booking, product) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0D1516; color: #DCE4E5; border-radius: 10px;">
      ${getEmailHeader()}
      <div style="background-color: #1A2B49; padding: 30px; border-radius: 10px;">
        <h2 style="color: #00E5FF; text-align: center;">✅ Booking Confirmed!</h2>
        <p style="color: #BAC9CC; text-align: center; font-size: 16px;">
          Dear ${userName || 'Guest'},
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
      ${getEmailFooter()}
    </div>
  `;
};

// ✅ Payment Receipt Email Template
const getPaymentReceiptEmailTemplate = (userName, payment, booking, product) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0D1516; color: #DCE4E5; border-radius: 10px;">
      ${getEmailHeader()}
      <div style="background-color: #1A2B49; padding: 30px; border-radius: 10px;">
        <h2 style="color: #00E5FF; text-align: center;">💰 Payment Successful!</h2>
        <p style="color: #BAC9CC; text-align: center; font-size: 16px;">
          Dear ${userName || 'Guest'},
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
        </div>
        <div style="background-color: #0D1516; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 3px solid #00E5FF;">
          <p style="color: #00E5FF; font-size: 12px; margin: 0;">📧 This is a system generated receipt. Please keep this for your records.</p>
        </div>
        <p style="color: #849396; text-align: center; font-size: 14px;">
          Thank you for choosing SeaSoul!
        </p>
      </div>
      ${getEmailFooter()}
    </div>
  `;
};

// ✅ Notification Email Template
const getNotificationEmailTemplate = (title, message) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0D1516; color: #DCE4E5; border-radius: 10px;">
      ${getEmailHeader()}
      <div style="background-color: #1A2B49; padding: 30px; border-radius: 10px;">
        <h2 style="color: #00E5FF; text-align: center;">📢 ${title}</h2>
        <p style="color: #BAC9CC; font-size: 16px; line-height: 1.8;">
          ${message}
        </p>
        <p style="color: #849396; text-align: center; font-size: 14px; margin-top: 20px;">
          Stay updated with SeaSoul!
        </p>
      </div>
      ${getEmailFooter()}
    </div>
  `;
};

module.exports = {
  getWelcomeEmailTemplate,
  getOTPEmailTemplate,
  getPasswordResetOTPEmailTemplate,
  getPasswordChangedEmailTemplate,
  getBookingConfirmationEmailTemplate,
  getPaymentReceiptEmailTemplate,
  getNotificationEmailTemplate,
};