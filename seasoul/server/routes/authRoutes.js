// routes/authRoutes.js - UPDATED

const express = require('express');
const router = express.Router();

// ✅ Existing Controllers
const { 
  register, 
  login, 
  forgotPassword, 
  resetPassword,
  changePassword 
} = require('../controllers/authController');

const { 
  sendOTP, 
  verifyOTP, 
  resendOTP 
} = require('../controllers/otpController');

const { googleLogin } = require('../controllers/googleAuthController');
const { protect } = require('../middleware/authMiddleware');

// ==================== Test Route ====================
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Auth API is working!' });
});

// ==================== Normal Auth Routes ====================
router.post('/register', register);
router.post('/login', login);

// ==================== OTP Routes - Phone ONLY ====================
router.post('/send-otp', sendOTP);  // ✅ Only phone
router.post('/verify-otp', verifyOTP);  // ✅ Only phone
router.post('/resend-otp', resendOTP);  // ✅ Only phone

// ==================== Password Management ====================
router.post('/forgot-password', forgotPassword);  // ✅ Only phone
router.post('/reset-password', resetPassword);  // ✅ Only phone
router.post('/change-password', protect, changePassword);  // ✅ Email notification

// ==================== Google Login Route ====================
router.post('/google', googleLogin);

module.exports = router;