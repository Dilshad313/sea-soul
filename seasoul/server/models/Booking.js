const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
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
    itemType: {
      type: String,
      enum: ['product', 'activity'],
      default: 'product',
    },
    guests: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    checkIn: {
      type: Date,
      required: true,
      default: Date.now,
    },
    checkOut: {
      type: Date,
      required: true,
      default: function() {
        const date = new Date();
        date.setDate(date.getDate() + 3);
        return date;
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    specialRequests: {
      type: String,
      default: '',
    },
    bookingReference: {
      type: String,
      unique: true,
      default: function() {
        const prefix = 'SS';
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${prefix}${timestamp}${random}`;
      },
    },
  },
  { timestamps: true }
);

// Index for faster queries
BookingSchema.index({ userId: 1, createdAt: -1 });
BookingSchema.index({ bookingReference: 1 });
BookingSchema.index({ status: 1 });

// ✅ ALTERNATIVE FIX: Using pre-save without next parameter
BookingSchema.pre('save', async function() {
  // This is async function, no next parameter needed
  if (this.productId) {
    this.itemType = 'product';
  } else if (this.activityId) {
    this.itemType = 'activity';
  }
});

// Virtual for item details
BookingSchema.virtual('item').get(function() {
  return this.productId || this.activityId;
});

// Method to get item name
BookingSchema.methods.getItemName = async function() {
  if (this.productId) {
    const product = await mongoose.model('Product').findById(this.productId);
    return product ? product.name : 'Package';
  }
  if (this.activityId) {
    const activity = await mongoose.model('Activity').findById(this.activityId);
    return activity ? activity.name : 'Activity';
  }
  return 'Unknown';
};

module.exports = mongoose.model('Booking', BookingSchema);