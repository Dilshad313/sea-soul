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
      enum: ['card', 'upi', 'netbanking', 'wallet', 'razorpay', 'other'],
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
    // ✅ Razorpay specific fields
    razorpayDetails: {
      orderId: {
        type: String,
        default: '',
      },
      paymentId: {
        type: String,
        default: '',
      },
      signature: {
        type: String,
        default: '',
      },
    },
  },
  { timestamps: true }
);

// Index for faster queries
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ transactionId: 1 });
PaymentSchema.index({ bookingId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ 'razorpayDetails.orderId': 1 });
PaymentSchema.index({ 'razorpayDetails.paymentId': 1 });

// ✅ FIXED: Pre-save middleware - Using async function without next
PaymentSchema.pre('save', async function() {
  // This is async function, no next parameter needed
  if (!this.paymentDate) {
    this.paymentDate = new Date();
  }
  
  // Auto-generate transaction ID if not provided
  if (!this.transactionId) {
    const prefix = 'PAY';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.transactionId = `${prefix}${timestamp}${random}`;
  }
});

// Method to get payment summary
PaymentSchema.methods.getSummary = function() {
  return {
    id: this._id,
    transactionId: this.transactionId,
    amount: this.amount,
    method: this.method,
    status: this.status,
    date: this.paymentDate,
    razorpayOrderId: this.razorpayDetails?.orderId || null,
    razorpayPaymentId: this.razorpayDetails?.paymentId || null,
  };
};

// ✅ New: Check if payment was via Razorpay
PaymentSchema.methods.isRazorpayPayment = function() {
  return this.method === 'razorpay' && 
         this.razorpayDetails && 
         this.razorpayDetails.orderId && 
         this.razorpayDetails.paymentId;
};

// ✅ New: Get Razorpay order ID
PaymentSchema.methods.getRazorpayOrderId = function() {
  return this.razorpayDetails?.orderId || null;
};

// ✅ New: Get Razorpay payment ID
PaymentSchema.methods.getRazorpayPaymentId = function() {
  return this.razorpayDetails?.paymentId || null;
};

// Static method to get user payment history
PaymentSchema.statics.getUserPayments = async function(userId, limit = 10) {
  return this.find({ userId })
    .populate('bookingId')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// ✅ New: Get payments by Razorpay order ID
PaymentSchema.statics.getByRazorpayOrderId = async function(orderId) {
  return this.findOne({ 'razorpayDetails.orderId': orderId });
};

// ✅ New: Get payments by Razorpay payment ID
PaymentSchema.statics.getByRazorpayPaymentId = async function(paymentId) {
  return this.findOne({ 'razorpayDetails.paymentId': paymentId });
};

// Static method to get total revenue
PaymentSchema.statics.getTotalRevenue = async function() {
  const result = await this.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  return result.length > 0 ? result[0].total : 0;
};

// ✅ New: Get revenue breakdown by payment method
PaymentSchema.statics.getRevenueByMethod = async function() {
  const result = await this.aggregate([
    { $match: { status: 'completed' } },
    { 
      $group: { 
        _id: '$method', 
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      } 
    },
    { $sort: { total: -1 } }
  ]);
  return result;
};

// ✅ New: Get Razorpay specific revenue
PaymentSchema.statics.getRazorpayRevenue = async function() {
  const result = await this.aggregate([
    { 
      $match: { 
        status: 'completed', 
        method: 'razorpay' 
      } 
    },
    { 
      $group: { 
        _id: null, 
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      } 
    }
  ]);
  return result.length > 0 ? result[0] : { total: 0, count: 0 };
};

module.exports = mongoose.model('Payment', PaymentSchema);