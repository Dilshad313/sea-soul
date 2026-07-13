class ApiConstants {
  // ==================== BASE URL - YOUR VERCEL BACKEND ====================
  static const String baseUrl = 'https://sea-soul-backend.vercel.app';
  
  // ==================== AUTH ENDPOINTS ====================
  static const String login = '$baseUrl/api/auth/login';
  static const String register = '$baseUrl/api/auth/register';
  static const String logout = '$baseUrl/api/auth/logout';
  static const String refreshToken = '$baseUrl/api/auth/refresh-token';
  static const String forgotPassword = '$baseUrl/api/auth/forgot-password';
  static const String resetPassword = '$baseUrl/api/auth/reset-password';
  static const String verifyEmail = '$baseUrl/api/auth/verify-email';
  static const String resendVerification = '$baseUrl/api/auth/resend-verification';
  static const String googleAuth = '$baseUrl/api/auth/google';
  
  // ==================== OTP ENDPOINTS ====================
  static const String sendOTP = '$baseUrl/api/auth/send-otp';
  static const String verifyOTP = '$baseUrl/api/auth/verify-otp';
  static const String resendOTP = '$baseUrl/api/auth/resend-otp';

  // ==================== USER ENDPOINTS ====================
  static const String profile = '$baseUrl/api/user/profile';
  static const String users = '$baseUrl/api/users';
  static const String uploadProfileImage = '$baseUrl/api/user/upload-profile-image';
  static const String deleteProfileImage = '$baseUrl/api/user/delete-profile-image';
  static const String updateProfile = '$baseUrl/api/user/update-profile';
  static const String changePassword = '$baseUrl/api/user/change-password';
  static const String userSettings = '$baseUrl/api/user/settings';
  static const String userActivities = '$baseUrl/api/user/activities';

  // ==================== PRODUCT ENDPOINTS ====================
  static const String products = '$baseUrl/api/products';
  static String productById(String id) => '$baseUrl/api/products/$id';
  static String productsByCategory(String category) => '$baseUrl/api/products/category/$category';
  static const String featuredProducts = '$baseUrl/api/products/featured';
  static const String trendingProducts = '$baseUrl/api/products/trending';

  // ==================== ACTIVITY ENDPOINTS ====================
  static const String activities = '$baseUrl/api/activities';
  static String activityById(String id) => '$baseUrl/api/activities/$id';
  static String activitiesByCategory(String category) => '$baseUrl/api/activities/category/$category';
  static const String featuredActivities = '$baseUrl/api/activities/featured';
  static const String trendingActivities = '$baseUrl/api/activities/trending';

  // ==================== REVIEW ENDPOINTS ====================
  static const String reviews = '$baseUrl/api/reviews';
  static String reviewById(String id) => '$baseUrl/api/reviews/$id';
  static String reviewsByItem(String itemType, String itemId) => '$baseUrl/api/reviews/item/$itemType/$itemId';
  static const String userReviews = '$baseUrl/api/reviews/user';
  static const String recentReviews = '$baseUrl/api/reviews/recent';

  // ==================== NOTIFICATION ENDPOINTS ====================
  static const String notifications = '$baseUrl/api/notifications';
  static String notificationById(String id) => '$baseUrl/api/notifications/$id';
  static const String unreadCount = '$baseUrl/api/notifications/unread-count';
  static const String markAllRead = '$baseUrl/api/notifications/read-all';

  // ==================== ORDER ENDPOINTS ====================
  static const String orders = '$baseUrl/api/orders';
  static String orderById(String id) => '$baseUrl/api/orders/$id';
  static const String userOrders = '$baseUrl/api/orders/user';
  static const String createOrder = '$baseUrl/api/orders/create';
  static const String orderStatus = '$baseUrl/api/orders/status';

  // ==================== BOOKING ENDPOINTS ====================
  static const String bookings = '$baseUrl/api/bookings';
  static String bookingById(String id) => '$baseUrl/api/bookings/$id';
  static const String userBookings = '$baseUrl/api/bookings/user';
  static const String createBooking = '$baseUrl/api/bookings/create';

  // ==================== PAYMENT ENDPOINTS ====================
  static const String payments = '$baseUrl/api/payments';
  static const String createPayment = '$baseUrl/api/payments/create';
  static const String paymentStatus = '$baseUrl/api/payments/status';
}