const Notification = require('../models/Notification');
const User = require('../models/User');
// ✅ Import email service
const { sendNotificationEmail } = require('../services/emailService');

// ==================== CREATE NOTIFICATION ====================
exports.createNotification = async (userId, title, message, type, relatedId = null, imageUrl = null, data = {}) => {
  try {
    console.log('📢 Creating notification for user:', userId);
    console.log('📢 Title:', title);
    console.log('📢 Message:', message);
    console.log('📢 Type:', type);

    const notification = new Notification({
      userId,
      title,
      message,
      type,
      relatedId,
      imageUrl,
      data,
      isRead: false,
      isDeleted: false,
    });

    await notification.save();
    console.log('✅ Notification saved to database:', notification._id);

    // ✅ Send email notification using email service
    try {
      const user = await User.findById(userId);
      if (user && user.email) {
        await sendNotificationEmail(user, title, message);
        console.log('✅ Email sent to:', user.email);
      }
    } catch (emailError) {
      console.error('❌ Email send error:', emailError);
    }

    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    return null;
  }
};

// ==================== GET USER NOTIFICATIONS ====================
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0, unreadOnly = false } = req.query;

    console.log('📱 Fetching notifications for user:', userId);
    console.log('📱 Limit:', limit, 'Offset:', offset);

    let query = { userId, isDeleted: false };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const totalCount = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      userId, 
      isRead: false, 
      isDeleted: false 
    });

    console.log('✅ Found', notifications.length, 'notifications');
    console.log('📊 Unread count:', unreadCount);

    res.status(200).json({
      success: true,
      notifications,
      totalCount,
      unreadCount,
      offset: parseInt(offset),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error('❌ Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ==================== MARK NOTIFICATION AS READ ====================
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log('📖 Marking notification as read:', id);

    const notification = await Notification.findOne({ _id: id, userId });
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    notification.isRead = true;
    await notification.save();

    console.log('✅ Notification marked as read');

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ==================== MARK ALL AS READ ====================
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('📖 Marking all notifications as read for user:', userId);

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    console.log('✅ Marked', result.modifiedCount, 'notifications as read');

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      count: result.modifiedCount,
    });
  } catch (error) {
    console.error('❌ Error marking all as read:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ==================== DELETE NOTIFICATION ====================
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log('🗑️ Deleting notification:', id);

    const notification = await Notification.findOne({ _id: id, userId });
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    notification.isDeleted = true;
    await notification.save();

    console.log('✅ Notification deleted');

    res.status(200).json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ==================== DELETE ALL NOTIFICATIONS ====================
exports.deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('🗑️ Deleting all notifications for user:', userId);

    const result = await Notification.updateMany(
      { userId },
      { isDeleted: true }
    );

    console.log('✅ Deleted', result.modifiedCount, 'notifications');

    res.status(200).json({
      success: true,
      message: 'All notifications deleted',
      count: result.modifiedCount,
    });
  } catch (error) {
    console.error('❌ Error deleting all notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ==================== GET UNREAD COUNT ====================
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Notification.countDocuments({
      userId,
      isRead: false,
      isDeleted: false,
    });

    console.log('📊 Unread count for user', userId, ':', count);

    res.status(200).json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    console.error('❌ Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};