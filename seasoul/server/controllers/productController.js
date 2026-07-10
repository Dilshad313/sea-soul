const Product = require('../models/Product');
const { createNotificationForAllUsers } = require('../utils/createNotification');

// ✅ Get all products with sorting and filtering
exports.getProducts = async (req, res) => {
  try {
    const { sort, category, search, limit } = req.query;
    
    let query = {};
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }
    
    let sortOptions = {};
    switch (sort) {
      case 'price-low':
        sortOptions = { price: 1 };
        break;
      case 'price-high':
        sortOptions = { price: -1 };
        break;
      case 'rating':
        sortOptions = { rating: -1 };
        break;
      case 'popular':
        sortOptions = { reviews: -1 };
        break;
      case 'featured':
        sortOptions = { isFeatured: -1 };
        break;
      case 'newest':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }
    
    let productsQuery = Product.find(query).sort(sortOptions);
    
    if (limit && !isNaN(limit)) {
      productsQuery = productsQuery.limit(parseInt(limit));
    }
    
    const products = await productsQuery;
    
    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Error in getProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ✅ Get single product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Error in getProductById:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ✅ Get featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(3);
    
    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error('Error in getFeaturedProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ✅ Get trending products
exports.getTrendingProducts = async (req, res) => {
  try {
    const products = await Product.find({ isTrending: true })
      .sort({ rating: -1 })
      .limit(4);
    
    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error('Error in getTrendingProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ✅ Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const products = await Product.find({ category })
      .sort({ rating: -1 });
    
    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Error in getProductsByCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ✅ CREATE PRODUCT - With Notification for all users
exports.createProduct = async (req, res) => {
  try {
    console.log('📦 Creating new product...');
    const product = new Product(req.body);
    await product.save();
    console.log('✅ Product created:', product._id);

    // ✅ Send notification to ALL users about new product
    const imageUrl = product.images && product.images.length > 0 ? product.images[0] : null;
    
    const notificationCount = await createNotificationForAllUsers(
      '🌟 New Package Added!',
      `🌴 ${product.name} - ₹${product.price} in ${product.location}. Book now!`,
      'product',
      imageUrl,
      product._id
    );
    
    console.log(`✅ Notification sent to ${notificationCount} users`);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    console.error('❌ Product creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    console.error('❌ Product update error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('❌ Product delete error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};