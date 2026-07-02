import 'package:flutter/foundation.dart' show kIsWeb;

class ApiConstants {
  static String get baseUrl {
    if (kIsWeb) {
      // For web, use localhost
      return 'http://localhost:5000';
    } else {
      // For Android emulator
      return 'http://10.0.2.2:5000';
      // For physical device, use your computer's IP
      // return 'http://192.168.1.100:5000';
    }
  }

  static String get register => '$baseUrl/api/auth/register';
  static String get login => '$baseUrl/api/auth/login';
  static String get sendOTP => '$baseUrl/api/auth/send-otp';
  static String get verifyOTP => '$baseUrl/api/auth/verify-otp';
  static String get resendOTP => '$baseUrl/api/auth/resend-otp';
  static String get forgotPassword => '$baseUrl/api/auth/forgot-password';
  static String get resetPassword => '$baseUrl/api/auth/reset-password';
  static String get changePassword => '$baseUrl/api/auth/change-password';
  
  static String get profile => '$baseUrl/api/profile';
  static String get uploadProfileImage => '$baseUrl/api/profile/upload-image';
  static String get deleteProfileImage => '$baseUrl/api/profile/image';
  
  // Product APIs
  static String get products => '$baseUrl/api/products';
  static String get featuredProducts => '$baseUrl/api/products/featured';
  static String get trendingProducts => '$baseUrl/api/products/trending';
  static String productById(String id) => '$baseUrl/api/products/$id';
  static String productsByCategory(String category) => '$baseUrl/api/products/category/$category';
}