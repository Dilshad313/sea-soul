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

const { sendOTP, verifyOTP, resendOTP } = require('../controllers/otpController');

// ✅ Google Auth Controller - Import correctly
const { googleLogin } = require('../controllers/googleAuthController');

const { protect } = require('../middleware/authMiddleware');

// ==================== Test Route ====================
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Auth API is working!' });
});

// ==================== Normal Auth Routes ====================
router.post('/register', register);
router.post('/login', login);

// ==================== OTP Routes ====================
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// ==================== Password Management ====================
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', protect, changePassword);

// ==================== Google Login Route ====================
router.post('/google', googleLogin);

module.exports = router;