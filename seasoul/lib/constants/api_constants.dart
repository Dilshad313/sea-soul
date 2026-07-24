import 'package:flutter/foundation.dart' show kIsWeb;

class ApiConstants {
  // ==================== BASE URL ====================
  static const String HOSTED_URL = 'https://sea-soul-backend.vercel.app';
  static const String LOCAL_URL = 'http://localhost:5000';
  static const String EMULATOR_URL = 'http://10.0.2.2:5000';

  static String get baseUrl {
    // ✅ Use hosted URL for production
    return HOSTED_URL;
  }

  // ==================== AUTH ====================
  static String get sendOTP => '$baseUrl/api/auth/send-otp';
  static String get verifyOTP => '$baseUrl/api/auth/verify-otp';
  static String get resendOTP => '$baseUrl/api/auth/resend-otp';
  static String get register => '$baseUrl/api/auth/register';
  static String get login => '$baseUrl/api/auth/login';
  static String get forgotPassword => '$baseUrl/api/auth/forgot-password';
  static String get resetPassword => '$baseUrl/api/auth/reset-password';
  static String get changePassword => '$baseUrl/api/auth/change-password';
  static String get logout => '$baseUrl/api/auth/logout';
  
  // ✅ ADD THESE - Email verification endpoints
  static String get verifyEmail => '$baseUrl/api/auth/verify-email';
  static String get resendVerification => '$baseUrl/api/auth/resend-verification';
  
  static String get googleAuth => '$baseUrl/api/auth/google';
  
  // ==================== PROFILE ====================
  static String get profile => '$baseUrl/api/user/profile';
  static String get uploadProfileImage => '$baseUrl/api/user/upload-profile-image';
  static String get deleteProfileImage => '$baseUrl/api/user/delete-profile-image';
  
  // ==================== PRODUCTS ====================
  static String get products => '$baseUrl/api/products';
  static String get featuredProducts => '$baseUrl/api/products/featured';
  static String get trendingProducts => '$baseUrl/api/products/trending';
  static String productById(String id) => '$baseUrl/api/products/$id';
  static String productsByCategory(String category) => '$baseUrl/api/products/category/$category';
  
  // ==================== ACTIVITIES ====================
  static String get activities => '$baseUrl/api/activities';
  static String get featuredActivities => '$baseUrl/api/activities/featured';
  static String get trendingActivities => '$baseUrl/api/activities/trending';
  static String activityById(String id) => '$baseUrl/api/activities/$id';
  static String activitiesByCategory(String category) => '$baseUrl/api/activities/category/$category';

  // ==================== NOTIFICATIONS ====================
  static String get notifications => '$baseUrl/api/notifications';
  static String get unreadCount => '$baseUrl/api/notifications/unread-count';
  static String markAsRead(String id) => '$baseUrl/api/notifications/$id/read';
  static String get markAllAsRead => '$baseUrl/api/notifications/read-all';
  static String deleteNotification(String id) => '$baseUrl/api/notifications/$id';
  static String get deleteAllNotifications => '$baseUrl/api/notifications';

  // ==================== REVIEWS ====================
  static String get reviews => '$baseUrl/api/reviews';
  static String itemReviews(String itemId, String itemType) => '$baseUrl/api/reviews/item/$itemType/$itemId';
  static String get userReviews => '$baseUrl/api/reviews/user';
  static String get recentReviews => '$baseUrl/api/reviews/recent';
  static String reviewHelpful(String id) => '$baseUrl/api/reviews/$id/helpful';
  static String deleteReview(String id) => '$baseUrl/api/reviews/$id';

  // ==================== BOOKING ====================
  static String get bookings => '$baseUrl/api/bookings';
  static String bookingById(String id) => '$baseUrl/api/bookings/$id';
  static String get userBookings => '$baseUrl/api/bookings/user';
  static String get createBooking => '$baseUrl/api/bookings';
  
  // ==================== ORDER ====================
  static String get orders => '$baseUrl/api/orders';
  static String orderById(String id) => '$baseUrl/api/orders/$id';
  static String get userOrders => '$baseUrl/api/orders/user';
  static String get createOrder => '$baseUrl/api/orders/create';

  // ==================== PAYMENT ====================
  static String get payments => '$baseUrl/api/payments';
  static String get createPayment => '$baseUrl/api/payments';
  static String get paymentStatus => '$baseUrl/api/payments/status';
  
  // ==================== RAZORPAY ====================
  static String get razorpayCreateOrder => '$baseUrl/api/razorpay/create-order';
  static String get razorpayVerifyPayment => '$baseUrl/api/razorpay/verify';
  static String get razorpayGetKey => '$baseUrl/api/razorpay/key';
  static String get razorpayTest => '$baseUrl/api/razorpay/test';
  static String get razorpayWebhook => '$baseUrl/api/razorpay/webhook';
  
  // ==================== RAZORPAY CONSTANTS ====================
  static const String razorpayCurrency = 'INR';
  static const int razorpayRetryCount = 3;
  static const bool razorpayRetryEnabled = true;
  static const String razorpayThemeColor = '#0099CC';
  
  // ==================== STATUS CONSTANTS ====================
  static const String paymentStatusPending = 'pending';
  static const String paymentStatusCompleted = 'completed';
  static const String paymentStatusFailed = 'failed';
  static const String paymentStatusRefunded = 'refunded';
  
  static const String bookingStatusPending = 'pending';
  static const String bookingStatusConfirmed = 'confirmed';
  static const String bookingStatusCompleted = 'completed';
  static const String bookingStatusCancelled = 'cancelled';

  // ==================== CATEGORIES ====================
  static String get categories => '$baseUrl/api/categories';
  static String get activeCategories => '$baseUrl/api/categories/active';
}