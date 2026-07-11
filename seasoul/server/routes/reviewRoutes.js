const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const {
  createReview,
  getItemReviews,
  getUserReviews,
  getReviewById,
  updateReview,
  deleteReview,
  toggleHelpful,
  getRecentReviews,
  getAllReviews,
  updateReviewStatus,
} = require('../controllers/reviewController');

// ==================== Public Routes ====================
router.get('/item/:itemType/:itemId', getItemReviews);
router.get('/recent', getRecentReviews);

// ==================== Protected Routes ====================
router.use(protect);

router.post('/', createReview);
router.get('/user', getUserReviews);
router.get('/:id', getReviewById);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);
router.put('/:id/helpful', toggleHelpful);

// ==================== Admin Routes ====================
router.get('/admin/all', isAdmin, getAllReviews);
router.put('/admin/:id/status', isAdmin, updateReviewStatus);

module.exports = router;