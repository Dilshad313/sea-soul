const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  forgotPassword, 
  resetPassword,
  changePassword 
} = require('../controllers/authController');
const { sendOTP, verifyOTP, resendOTP } = require('../controllers/otpController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', protect, changePassword);

module.exports = router;