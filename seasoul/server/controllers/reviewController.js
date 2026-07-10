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

    // ✅ Check if booking exists and belongs to user
    const booking = await Booking.findOne({ _id: bookingId, userId });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // ✅ Check if booking is completed
    if (booking.status !== 'completed' && booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'You can only review completed bookings',
      });
    }

    // ✅ Check if already reviewed
    const existingReview = await Review.findOne({ bookingId, userId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking',
      });
    }

    // ✅ Get item details
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

    // ✅ Get user details
    const user = await User.findById(userId);

    // ✅ Create review
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
      isApproved: true, // Auto-approve for now
      itemType,
      itemName,
      userName: user.fullName || 'User',
      userProfileImage: user.profileImage || '',
    });

    await review.save();
    console.log('✅ Review saved:', review._id);

    // ✅ Update product/activity rating
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

    // ✅ Create notification for admin
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
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const totalCount = await Review.countDocuments(query);

    // Get average rating
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

// ==================== GET ALL REVIEWS (Admin) ====================
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('userId', 'fullName email')
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

// ==================== DELETE REVIEW ====================
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findOne({ _id: id, userId });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    await review.deleteOne();

    // ✅ Update product/activity rating
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
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Get average rating for each item
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