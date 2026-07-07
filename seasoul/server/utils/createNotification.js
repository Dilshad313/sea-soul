const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendNotificationEmail } = require('../services/emailService');

// ✅ Create notification for single user
const createNotification = async (userId, title, message, type, relatedId = null, imageUrl = null, data = {}) => {
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

    // Send email notification
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

// ✅ Create notification for all users (Admin events)
const createNotificationForAllUsers = async (title, message, type, imageUrl = null, relatedId = null) => {
  try {
    console.log('📢 Creating notification for ALL users');
    console.log('📢 Title:', title);
    console.log('📢 Message:', message);
    console.log('📢 Type:', type);

    const users = await User.find({ role: 'user', isActive: true });
    console.log(`👥 Found ${users.length} users`);

    if (users.length === 0) {
      console.log('⚠️ No users found to send notifications');
      return 0;
    }

    const notifications = [];
    for (const user of users) {
      const notification = new Notification({
        userId: user._id,
        title,
        message,
        type,
        imageUrl,
        relatedId,
        isRead: false,
        isDeleted: false,
      });
      notifications.push(notification);
      
      // Send email to each user
      try {
        await sendNotificationEmail(user, title, message);
        console.log(`✅ Email sent to: ${user.email}`);
      } catch (emailError) {
        console.error(`❌ Email send error for ${user.email}:`, emailError);
      }
    }

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      console.log(`✅ ${notifications.length} notifications saved to database`);
    }

    return notifications.length;
  } catch (error) {
    console.error('❌ Error creating notifications for all users:', error);
    return 0;
  }
};

module.exports = {
  createNotification,
  createNotificationForAllUsers,
};