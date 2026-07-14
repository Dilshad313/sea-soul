const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getRazorpayKey,
} = require('../controllers/paymentController');

// ✅ Get Razorpay Key (Public)
router.get('/key', protect, getRazorpayKey);

// ✅ Create Razorpay Order
router.post('/create-order', protect, createRazorpayOrder);

// ✅ Verify Razorpay Payment
router.post('/verify', protect, verifyRazorpayPayment);

module.exports = router;