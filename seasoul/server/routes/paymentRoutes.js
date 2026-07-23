// routes/paymentRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getRazorpayKey,
  createRazorpayOrder,
  verifyRazorpayPayment,
  testRazorpayConfig,
  checkEnvironment,
} = require('../controllers/paymentController');

// ==================== PUBLIC ROUTES ====================
// These routes don't require authentication

// ✅ Test Razorpay configuration
router.get('/test-config', testRazorpayConfig);

// ✅ Check environment variables
router.get('/check-env', checkEnvironment);

// ==================== PROTECTED ROUTES ====================
// All routes below this require authentication

// ✅ Apply authentication middleware to all routes below
router.use(protect);

// ✅ Get Razorpay Key (for frontend)
router.get('/key', getRazorpayKey);

// ✅ Create Razorpay Order
router.post('/create-order', createRazorpayOrder);

// ✅ Verify Payment
router.post('/verify', verifyRazorpayPayment);

// ✅ Test authenticated config
router.get('/test-auth-config', testRazorpayConfig);

module.exports = router;