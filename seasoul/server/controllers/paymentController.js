// Add to controllers/paymentController.js

const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ 1. Get Razorpay Key
exports.getRazorpayKey = async (req, res) => {
  try {
    console.log('🔑 Getting Razorpay key for user:', req.user.id);

    const keyId = process.env.RAZORPAY_KEY_ID;
    
    if (!keyId) {
      console.error('❌ RAZORPAY_KEY_ID not set in environment');
      return res.status(500).json({
        success: false,
        message: 'Razorpay key not configured',
      });
    }

    console.log('✅ Razorpay key retrieved:', keyId);

    res.status(200).json({
      success: true,
      key_id: keyId,
    });
  } catch (error) {
    console.error('❌ Error getting Razorpay key:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ✅ 2. Create Razorpay Order
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;
    const userId = req.user.id;

    console.log('📦 Creating Razorpay order for user:', userId);
    console.log('📦 Amount:', amount);
    console.log('📦 Receipt:', receipt);

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount',
      });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: currency || 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);
    console.log('✅ Razorpay order created:', order.id);

    res.status(200).json({
      success: true,
      id: order.id,
      entity: order.entity,
      amount: order.amount,
      amount_paid: order.amount_paid,
      amount_due: order.amount_due,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
      attempts: order.attempts,
      notes: order.notes,
      created_at: order.created_at,
    });
  } catch (error) {
    console.error('❌ Razorpay order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create Razorpay order',
      error: error.message,
    });
  }
};

// ✅ 3. Verify Razorpay Payment
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      bookingId,
      amount 
    } = req.body;
    const userId = req.user.id;

    console.log('🔐 Verifying Razorpay payment for user:', userId);
    console.log('🔐 Order ID:', razorpay_order_id);
    console.log('🔐 Payment ID:', razorpay_payment_id);

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('❌ Invalid signature');
      return res.status(400).json({
        success: false,
        message: 'Invalid signature',
      });
    }

    console.log('✅ Signature verified successfully');

    // Find booking
    const Booking = require('../models/Booking');
    let booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Get item details
    let itemName = 'Package';
    let itemImage = null;

    if (booking.productId) {
      const Product = require('../models/Product');
      const product = await Product.findById(booking.productId);
      if (product) {
        itemName = product.name || 'Package';
        itemImage = product.images && product.images.length > 0 ? product.images[0] : null;
      }
    } else if (booking.activityId) {
      const Activity = require('../models/Activity');
      const activity = await Activity.findById(booking.activityId);
      if (activity) {
        itemName = activity.name || 'Activity';
        itemImage = activity.images && activity.images.length > 0 ? activity.images[0] : null;
      }
    }

    // Create payment record
    const Payment = require('../models/Payment');
    const payment = new Payment({
      userId,
      bookingId,
      amount: amount || booking.totalAmount || 0,
      currency: 'INR',
      method: 'razorpay',
      status: 'completed',
      transactionId: razorpay_payment_id,
      razorpayDetails: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
      },
      paymentDate: new Date(),
    });

    await payment.save();
    console.log('✅ Payment saved:', payment._id);

    // Update booking status
    booking.status = 'confirmed';
    booking.paymentStatus = 'paid';
    await booking.save();
    console.log('✅ Booking updated:', bookingId);

    // Create notification
    const { createNotification } = require('../utils/createNotification');
    await createNotification(
      userId,
      '💰 Payment Successful',
      `Your payment of ₹${payment.amount} for ${itemName} was successful!`,
      'payment',
      payment._id,
      itemImage,
      { 
        paymentId: payment._id, 
        bookingId: bookingId, 
        amount: payment.amount,
        method: 'razorpay',
        itemName: itemName,
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
      }
    );
    console.log('✅ Payment notification created');

    res.status(200).json({
      success: true,
      message: 'Payment verified and processed successfully',
      payment: {
        id: payment._id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        status: payment.status,
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
      },
      booking: {
        id: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
      },
    });
  } catch (error) {
    console.error('❌ Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};