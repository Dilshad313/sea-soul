import 'package:flutter/foundation.dart' show kIsWeb;

class ApiConstants {
  // ✅ YOUR HOSTED BACKEND URL (Vercel)
  static const String HOSTED_URL = 'https://sea-soul-backend.vercel.app';
  
  // ✅ Local Backend URLs
  static const String LOCAL_URL = 'http://localhost:5000';
  static const String EMULATOR_URL = 'http://10.0.2.2:5000';

  static String get baseUrl {
    // ✅ ALWAYS USE HOSTED URL FOR NOW
    // This will work on both web and mobile
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
  
  // ==================== PROFILE ====================
  static String get profile => '$baseUrl/api/profile';
  static String get uploadProfileImage => '$baseUrl/api/profile/upload-image';
  static String get deleteProfileImage => '$baseUrl/api/profile/image';
  
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
  static String reviewHelpful(String id) => '$baseUrl/api/reviews/$id/helpful';
  static String deleteReview(String id) => '$baseUrl/api/reviews/$id';

  // ==================== CATEGORIES ====================
  static String get categories => '$baseUrl/api/categories';
  static String get activeCategories => '$baseUrl/api/categories/active';

  // ==================== BOOKINGS ====================
  static String get bookings => '$baseUrl/api/bookings';

  // ==================== PAYMENTS ====================
  static String get payments => '$baseUrl/api/payments';
}