const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const {
  createReview,
  getItemReviews,
  getUserReviews,
  getAllReviews,
  deleteReview,
  toggleHelpful,
  getRecentReviews, // ✅ Add this
} = require('../controllers/reviewController');

// ==================== Public Routes ====================
// Get reviews for specific item
router.get('/item/:itemType/:itemId', getItemReviews);

// ✅ Get recent reviews (Home page) - Public route
router.get('/recent', getRecentReviews);

// ==================== Protected Routes ====================
router.use(protect);

// Create review
router.post('/', createReview);

// Get user's reviews
router.get('/user', getUserReviews);

// Toggle helpful
router.put('/:id/helpful', toggleHelpful);

// Delete review
router.delete('/:id', deleteReview);

// ==================== Admin Routes ====================
router.get('/admin/all', isAdmin, getAllReviews);

module.exports = router;