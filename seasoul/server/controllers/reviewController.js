const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Product = require('../models/Product');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { createNotification } = require('../utils/createNotification');

// ==================== CREATE REVIEW ====================
exports.createReview = async (req, res) => {
  try {
    const { 
      productId, 
      activityId, 
      bookingId, 
      rating, 
      title, 
      comment, 
      images 
    } = req.body;
    
    const userId = req.user.id;

    console.log('📝 Creating review for user:', userId);
    console.log('📝 Booking ID:', bookingId);
    console.log('📝 Rating:', rating);

    const booking = await Booking.findOne({ _id: bookingId, userId });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.status !== 'completed' && booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'You can only review completed bookings',
      });
    }

    const existingReview = await Review.findOne({ bookingId, userId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking',
      });
    }

    let itemName = '';
    let itemType = 'product';
    let itemId = productId || activityId;

    if (productId) {
      const product = await Product.findById(productId);
      if (product) {
        itemName = product.name || 'Package';
        itemType = 'product';
      }
    } else if (activityId) {
      const activity = await Activity.findById(activityId);
      if (activity) {
        itemName = activity.name || 'Activity';
        itemType = 'activity';
      }
    }

    const user = await User.findById(userId);

    const review = new Review({
      userId,
      productId: productId || null,
      activityId: activityId || null,
      bookingId,
      rating,
      title,
      comment,
      images: images || [],
      isVerified: true,
      isApproved: true,
      itemType,
      itemName,
      userName: user.fullName || 'User',
      userProfileImage: user.profileImage || '',
    });

    await review.save();
    console.log('✅ Review saved:', review._id);

    if (productId) {
      const avg = await Review.getAverageRating(productId, 'product');
      await Product.findByIdAndUpdate(productId, {
        rating: avg.average,
        reviews: avg.count,
      });
    } else if (activityId) {
      const avg = await Review.getAverageRating(activityId, 'activity');
      await Activity.findByIdAndUpdate(activityId, {
        rating: avg.average,
        reviews: avg.count,
      });
    }

    await createNotification(
      userId,
      '⭐ New Review Submitted',
      `You reviewed "${itemName}" with ${rating} stars! Thank you for your feedback.`,
      'general',
      review._id,
      null,
      { reviewId: review._id, itemName, rating }
    );

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    console.error('❌ Review creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ==================== GET REVIEWS FOR ITEM ====================
exports.getItemReviews = async (req, res) => {
  try {
    const { itemId, itemType } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    console.log('📱 Fetching reviews for item:', itemId, 'Type:', itemType);

    const field = itemType === 'product' ? 'productId' : 'activityId';
    const query = { 
      [field]: itemId, 
      isApproved: true 
    };

    const reviews = await Review.find(query)
      .populate('userId', 'fullName email profileImage')
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const totalCount = await Review.countDocuments(query);

    const avgResult = await Review.getAverageRating(itemId, itemType);

    res.status(200).json({
      success: true,
      reviews,
      totalCount,
      averageRating: avgResult.average || 0,
      totalReviews: avgResult.count || 0,
      offset: parseInt(offset),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error('❌ Error getting reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ==================== GET USER REVIEWS ====================
exports.getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;

    const reviews = await Review.find({ userId })
      .populate('productId', 'name images')
      .populate('activityId', 'name images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error('❌ Error getting user reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ==================== GET SINGLE REVIEW ====================
exports.getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findOne({ _id: id, userId })
      .populate('productId', 'name images')
      .populate('activityId', 'name images');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    console.error('❌ Error getting review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ==================== UPDATE REVIEW ====================
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { rating, title, comment, images } = req.body;

    console.log('📝 Updating review:', id);
    console.log('👤 User:', userId);

    const review = await Review.findOne({ _id: id, userId });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you are not authorized',
      });
    }

    // Update fields
    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;
    if (images) review.images = images;
    review.isEdited = true;
    review.editedAt = new Date();

    await review.save();
    console.log('✅ Review updated:', review._id);

    // Update product/activity rating
    if (review.productId) {
      const avg = await Review.getAverageRating(review.productId, 'product');
      await Product.findByIdAndUpdate(review.productId, {
        rating: avg.average,
        reviews: avg.count,
      });
    } else if (review.activityId) {
      const avg = await Review.getAverageRating(review.activityId, 'activity');
      await Activity.findByIdAndUpdate(review.activityId, {
        rating: avg.average,
        reviews: avg.count,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review,
    });
  } catch (error) {
    console.error('❌ Review update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ==================== DELETE REVIEW ====================
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log('🗑️ Deleting review:', id);
    console.log('👤 User:', userId);

    const review = await Review.findOne({ _id: id, userId });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you are not authorized',
      });
    }

    // Store productId/activityId before deletion
    const productId = review.productId;
    const activityId = review.activityId;

    await review.deleteOne();
    console.log('✅ Review deleted:', id);

    // Update product/activity rating
    if (productId) {
      const avg = await Review.getAverageRating(productId, 'product');
      await Product.findByIdAndUpdate(productId, {
        rating: avg.average,
        reviews: avg.count,
      });
    } else if (activityId) {
      const avg = await Review.getAverageRating(activityId, 'activity');
      await Activity.findByIdAndUpdate(activityId, {
        rating: avg.average,
        reviews: avg.count,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('❌ Review delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ==================== TOGGLE HELPFUL ====================
exports.toggleHelpful = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    review.helpfulCount += 1;
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Marked as helpful',
      helpfulCount: review.helpfulCount,
    });
  } catch (error) {
    console.error('❌ Error toggling helpful:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ==================== GET RECENT REVIEWS (Home Page) ====================
exports.getRecentReviews = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const reviews = await Review.find({ isApproved: true })
      .populate('userId', 'fullName profileImage')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const reviewsWithAvg = await Promise.all(reviews.map(async (review) => {
      const itemId = review.productId || review.activityId;
      const itemType = review.productId ? 'product' : 'activity';
      const avg = await Review.getAverageRating(itemId, itemType);
      return {
        ...review.toObject(),
        averageRating: avg.average || 0,
        totalReviews: avg.count || 0,
      };
    }));

    res.status(200).json({
      success: true,
      reviews: reviewsWithAvg,
    });
  } catch (error) {
    console.error('❌ Error getting recent reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ==================== ADMIN: GET ALL REVIEWS ====================
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('userId', 'fullName email phone profileImage')
      .populate('productId', 'name price')
      .populate('activityId', 'name price')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error('❌ Error getting all reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ==================== ADMIN: UPDATE REVIEW STATUS ====================
exports.updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    review.isApproved = isApproved;
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review status updated',
      review,
    });
  } catch (error) {
    console.error('❌ Error updating review status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};