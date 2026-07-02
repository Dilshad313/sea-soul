const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const {
  getProfile,
  updateProfile,
  uploadProfileImage,
  deleteProfileImage
} = require('../controllers/profileController');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Handle multer errors
router.post('/profile/upload-image', protect, (req, res, next) => {
  upload.single('image')(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    } else if (err) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
}, uploadProfileImage);

router.delete('/profile/image', protect, deleteProfileImage);

module.exports = router;