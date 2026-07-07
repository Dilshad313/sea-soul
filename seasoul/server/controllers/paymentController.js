const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Product = require('../models/Product');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { createNotification } = require('../utils/createNotification');
const { sendPaymentReceiptEmail } = require('../services/emailService');

// ✅ Process Payment
exports.processPayment = async (req, res) => {
  try {
    const { bookingId, amount, method, cardDetails } = req.body;
    const userId = req.user.id;

    console.log('💰 Processing payment for user:', userId);
    console.log('💰 Booking ID:', bookingId);
    console.log('💰 Amount:', amount);
    console.log('💰 Method:', method);

    // Process payment
    const payment = new Payment({
      userId,
      bookingId,
      amount: amount || 0,
      method: method || 'card',
      status: 'completed',
      cardDetails: cardDetails || {},
    });

    await payment.save();
    console.log('✅ Payment saved:', payment._id);

    // Update booking status
    const booking = await Booking.findByIdAndUpdate(
      bookingId, 
      { status: 'confirmed' },
      { new: true }
    );
    console.log('✅ Booking updated:', bookingId);

    // Get item details for email
    let itemName = 'Package';
    let itemImage = null;

    if (booking) {
      if (booking.productId) {
        const product = await Product.findById(booking.productId);
        if (product) {
          itemName = product.name || 'Package';
          itemImage = product.images && product.images.length > 0 ? product.images[0] : null;
        }
      } else if (booking.activityId) {
        const activity = await Activity.findById(booking.activityId);
        if (activity) {
          itemName = activity.name || 'Activity';
          itemImage = activity.images && activity.images.length > 0 ? activity.images[0] : null;
        }
      }
    }

    // ✅ Send payment receipt email
    const user = await User.findById(userId);
    if (user) {
      await sendPaymentReceiptEmail(user, payment, booking, { name: itemName });
      console.log('✅ Payment receipt email sent to:', user.email);
    }

    // ✅ Create notification for payment
    await createNotification(
      userId,
      '💰 Payment Successful',
      `Your payment of ₹${amount} for ${itemName} was successful!`,
      'payment',
      payment._id,
      itemImage,
      { 
        paymentId: payment._id, 
        bookingId, 
        amount,
        method,
        itemName
      }
    );
    console.log('✅ Payment notification created');

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      payment,
      booking,
    });
  } catch (error) {
    console.error('❌ Payment processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ✅ Get all payments
exports.getPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 })
      .populate('bookingId');

    res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error('❌ Error getting payments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ✅ Get single payment
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findOne({ _id: id, userId })
      .populate('bookingId');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error('❌ Error getting payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};