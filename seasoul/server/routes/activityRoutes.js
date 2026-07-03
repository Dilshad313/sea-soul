const express = require('express');
const router = express.Router();
const {
  getActivities,
  getActivityById,
  getFeaturedActivities,
  getTrendingActivities,
  getActivitiesByCategory,
} = require('../controllers/activityController');

router.get('/activities', getActivities);
router.get('/activities/featured', getFeaturedActivities);
router.get('/activities/trending', getTrendingActivities);
router.get('/activities/category/:category', getActivitiesByCategory);
router.get('/activities/:id', getActivityById);

module.exports = router;