const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    method: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'wallet', 'other'],
      default: 'card',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId: {
      type: String,
      default: function() {
        const prefix = 'PAY';
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${prefix}${timestamp}${random}`;
      },
    },
    cardDetails: {
      last4: {
        type: String,
        default: '',
      },
      brand: {
        type: String,
        default: '',
      },
      expiryMonth: {
        type: String,
        default: '',
      },
      expiryYear: {
        type: String,
        default: '',
      },
    },
    upiId: {
      type: String,
      default: '',
    },
    bankName: {
      type: String,
      default: '',
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    refundReason: {
      type: String,
      default: '',
    },
    refundDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for faster queries
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ transactionId: 1 });
PaymentSchema.index({ bookingId: 1 });
PaymentSchema.index({ status: 1 });

// Method to get payment summary
PaymentSchema.methods.getSummary = function() {
  return {
    id: this._id,
    transactionId: this.transactionId,
    amount: this.amount,
    method: this.method,
    status: this.status,
    date: this.paymentDate,
  };
};

// Static method to get user payment history
PaymentSchema.statics.getUserPayments = async function(userId, limit = 10) {
  return this.find({ userId })
    .populate('bookingId')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get total revenue
PaymentSchema.statics.getTotalRevenue = async function() {
  const result = await this.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  return result.length > 0 ? result[0].total : 0;
};

// Pre-save middleware to set payment date
PaymentSchema.pre('save', function(next) {
  if (!this.paymentDate) {
    this.paymentDate = new Date();
  }
  next();
});

module.exports = mongoose.model('Payment', PaymentSchema);