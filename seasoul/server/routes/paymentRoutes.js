const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

const {
  getRazorpayKey,
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require('../controllers/paymentController');

// All payment routes require authentication
router.use(protect);

// Get Razorpay Key
router.get('/key', getRazorpayKey);

// Create Order
router.post('/create-order', createRazorpayOrder);

// Verify Payment
router.post('/verify', verifyRazorpayPayment);

module.exports = router;