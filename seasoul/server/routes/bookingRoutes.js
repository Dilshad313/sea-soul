const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking,
  updateBookingStatus,
} = require('../controllers/bookingController');

// All booking routes require authentication
router.use(protect);

// Create booking
router.post('/', createBooking);

// Get all bookings
router.get('/', getBookings);

// Get single booking
router.get('/:id', getBookingById);

// Cancel booking
router.put('/:id/cancel', cancelBooking);

// Admin: Update booking status
router.put('/:id/status', updateBookingStatus);

module.exports = router;