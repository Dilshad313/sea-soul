const Booking = require('../models/Booking');
const Product = require('../models/Product');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { createNotification } = require('../utils/createNotification');
// ✅ Import email service
const { sendBookingConfirmationEmail } = require('../services/emailService');

// ✅ Create Booking
exports.createBooking = async (req, res) => {
  try {
    const { 
      productId, 
      activityId, 
      guests, 
      checkIn, 
      checkOut, 
      totalAmount,
      itemType 
    } = req.body;
    
    const userId = req.user.id;

    console.log('📝 Creating booking for user:', userId);
    console.log('📝 Product ID:', productId);
    console.log('📝 Activity ID:', activityId);
    console.log('📝 Total Amount:', totalAmount);

    const booking = new Booking({
      userId,
      productId: productId || null,
      activityId: activityId || null,
      guests: guests || 1,
      checkIn: checkIn || new Date(),
      checkOut: checkOut || new Date(Date.now() + 86400000 * 3),
      totalAmount: totalAmount || 0,
      status: 'pending',
      paymentStatus: 'pending',
      itemType: itemType || (productId ? 'product' : 'activity'),
    });

    await booking.save();
    console.log('✅ Booking saved:', booking._id);

    let item = null;
    let itemName = 'Package';
    let itemLocation = '';
    let itemImage = '';

    if (productId) {
      item = await Product.findById(productId);
      if (item) {
        itemName = item.name || 'Package';
        itemLocation = item.location || '';
        itemImage = item.images && item.images.length > 0 ? item.images[0] : null;
      }
    } else if (activityId) {
      item = await Activity.findById(activityId);
      if (item) {
        itemName = item.name || 'Activity';
        itemLocation = item.location || '';
        itemImage = item.images && item.images.length > 0 ? item.images[0] : null;
      }
    }

    // ✅ Send booking confirmation email using email service
    const user = await User.findById(userId);
    if (user) {
      await sendBookingConfirmationEmail(user, booking, { name: itemName, location: itemLocation });
      console.log('✅ Booking confirmation email sent to:', user.email);
    }

    // ✅ Create notification for booking
    await createNotification(
      userId,
      '📅 Booking Confirmed',
      `Your booking for ${itemName} has been confirmed!`,
      'booking',
      booking._id,
      itemImage,
      { 
        bookingId: booking._id, 
        itemId: productId || activityId,
        totalAmount,
        itemName,
        checkIn,
        checkOut,
        guests
      }
    );
    console.log('✅ Booking notification created');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking,
    });
  } catch (error) {
    console.error('❌ Booking creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ✅ Get all bookings for user (ONLY PAID BOOKINGS)
exports.getBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    // ✅ Only return bookings that are paid
    const bookings = await Booking.find({ 
      userId,
      paymentStatus: 'paid' // Only show paid bookings
    })
      .sort({ createdAt: -1 })
      .populate('productId')
      .populate('activityId');

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error('❌ Error getting bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ✅ Get single booking
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findOne({ _id: id, userId })
      .populate('productId')
      .populate('activityId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error('❌ Error getting booking:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ✅ Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findOne({ _id: id, userId });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    await createNotification(
      userId,
      '❌ Booking Cancelled',
      `Your booking has been cancelled.`,
      'booking',
      booking._id,
      null,
      { bookingId: booking._id, status: 'cancelled' }
    );

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      booking,
    });
  } catch (error) {
    console.error('❌ Booking cancellation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ✅ Admin: Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    booking.status = status;
    await booking.save();

    await createNotification(
      booking.userId,
      `📅 Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      `Your booking status has been updated to: ${status}`,
      'booking',
      booking._id,
      null,
      { bookingId: booking._id, status }
    );

    res.status(200).json({
      success: true,
      message: 'Booking status updated',
      booking,
    });
  } catch (error) {
    console.error('❌ Booking status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ✅ Admin: Get all bookings (ONLY PAID BOOKINGS)
exports.getAllBookings = async (req, res) => {
  try {
    // ✅ Only return bookings that are paid
    const bookings = await Booking.find({ paymentStatus: 'paid' })
      .populate('userId', 'fullName email phone')
      .populate('productId', 'name price')
      .populate('activityId', 'name price')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error('❌ Error getting all bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ✅ User: Update booking (owner) - allows updating payment info and status
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findOne({ _id: id, userId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Only allow a limited set of fields to be updated by the user
    const allowed = ['paymentId', 'paymentStatus', 'status', 'specialRequests'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        booking[key] = req.body[key];
      }
    }

    await booking.save();

    // Create notification for booking update
    await createNotification(
      userId,
      '📅 Booking Updated',
      `Your booking ${booking.bookingReference} has been updated.`,
      'booking',
      booking._id,
      null,
      { bookingId: booking._id, status: booking.status, paymentStatus: booking.paymentStatus }
    );

    res.status(200).json({ success: true, message: 'Booking updated', booking });
  } catch (error) {
    console.error('❌ Booking update error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};