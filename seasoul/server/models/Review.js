const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    activityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity',
      default: null,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    images: {
      type: [String],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    itemType: {
      type: String,
      enum: ['product', 'activity'],
      required: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userProfileImage: {
      type: String,
      default: '',
    },
    // ✅ New fields for edit tracking
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for faster queries
ReviewSchema.index({ productId: 1, createdAt: -1 });
ReviewSchema.index({ activityId: 1, createdAt: -1 });
ReviewSchema.index({ userId: 1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ isApproved: 1 });

// Static method to get average rating
ReviewSchema.statics.getAverageRating = async function(itemId, itemType) {
  const field = itemType === 'product' ? 'productId' : 'activityId';
  const result = await this.aggregate([
    { $match: { [field]: new mongoose.Types.ObjectId(itemId), isApproved: true } },
    { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  return result.length > 0 ? { average: result[0].average, count: result[0].count } : { average: 0, count: 0 };
};

module.exports = mongoose.model('Review', ReviewSchema);