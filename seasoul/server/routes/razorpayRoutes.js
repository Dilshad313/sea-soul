const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getRazorpayKey,
  testRazorpayConfig,
} = require('../controllers/paymentController');

// ✅ Test Razorpay configuration (Public)
router.get('/test', testRazorpayConfig);

// ✅ Get Razorpay Key
// - In production this remains protected. In development we expose it so local
//   clients (mobile/emulator) can fetch the public key without needing a token.
if (process.env.NODE_ENV === 'production') {
  router.get('/key', protect, getRazorpayKey);
} else {
  router.get('/key', getRazorpayKey);
}

// ✅ Create Razorpay Order
// - Protected in production; public in development for quick testing
if (process.env.NODE_ENV === 'production') {
  router.post('/create-order', protect, createRazorpayOrder);
} else {
  router.post('/create-order', createRazorpayOrder);
}

// ✅ Verify Razorpay Payment
router.post('/verify', protect, verifyRazorpayPayment);

module.exports = router;