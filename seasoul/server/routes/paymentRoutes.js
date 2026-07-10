const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  processPayment,
  getPayments,
  getPaymentById,
} = require('../controllers/paymentController');

// All payment routes require authentication
router.use(protect);

// Process payment
router.post('/', processPayment);

// Get all payments
router.get('/', getPayments);

// Get single payment
router.get('/:id', getPaymentById);

module.exports = router;