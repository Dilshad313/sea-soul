import 'package:flutter/foundation.dart' show kIsWeb;

class ApiConstants {
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:5000';
    } else {
      return 'http://10.0.2.1:5000';
    }
  }

  static String get register => '$baseUrl/api/auth/register';
  static String get login => '$baseUrl/api/auth/login';
  static String get sendOTP => '$baseUrl/api/auth/send-otp';
  static String get verifyOTP => '$baseUrl/api/auth/verify-otp';
  static String get resendOTP => '$baseUrl/api/auth/resend-otp';
}