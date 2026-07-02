const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getTrendingProducts,
  getProductsByCategory,
} = require('../controllers/productController');

router.get('/products', getProducts);
router.get('/products/featured', getFeaturedProducts);
router.get('/products/trending', getTrendingProducts);
router.get('/products/category/:category', getProductsByCategory);
router.get('/products/:id', getProductById);

module.exports = router;