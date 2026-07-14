import 'dart:convert';
import 'package:seasoul/services/api_service.dart';
import 'package:seasoul/constants/api_constants.dart';

class AuthService {
  // Get current user from shared preferences
  static Future<Map<String, dynamic>?> getCurrentUser() async {
    try {
      final userData = await ApiService.getUserData();
      return userData;
    } catch (e) {
      print('❌ Error getting current user: $e');
      return null;
    }
  }

  // Get user token
  static Future<String?> getToken() async {
    return await ApiService.getToken();
  }

  // Check if user is logged in
  static Future<bool> isLoggedIn() async {
    return await ApiService.isLoggedIn();
  }

  // Login user
  static Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await ApiService.post(
        ApiConstants.login,
        {
          'identifier': email, // ✅ Backend uses 'identifier'
          'password': password,
        },
      );

      if (response['success'] == true) {
        // Save token and user data
        if (response['token'] != null) {
          await ApiService.saveToken(response['token']);
        }
        
        // ✅ Backend returns user data directly in response
        final userData = {
          '_id': response['_id'],
          'fullName': response['fullName'],
          'email': response['email'],
          'phone': response['phone'],
          'profileImage': response['profileImage'] ?? 
              'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png',
          'bio': response['bio'] ?? '',
          'location': response['location'] ?? '',
        };
        await ApiService.saveUserData(userData);
        return response;
      } else {
        throw Exception(response['message'] ?? 'Login failed');
      }
    } catch (e) {
      print('❌ Login error: $e');
      throw Exception('Login failed: $e');
    }
  }

  // Register user
  static Future<Map<String, dynamic>> register({
    required String fullName,
    required String email,
    required String password,
    required String phone,
  }) async {
    try {
      final response = await ApiService.post(
        ApiConstants.register,
        {
          'fullName': fullName,
          'email': email,
          'password': password,
          'phone': phone,
        },
      );

      if (response['success'] == true) {
        // Save token and user data if returned
        if (response['token'] != null) {
          await ApiService.saveToken(response['token']);
        }
        if (response['_id'] != null) {
          final userData = {
            '_id': response['_id'],
            'fullName': response['fullName'],
            'email': response['email'],
            'phone': response['phone'],
            'profileImage': response['profileImage'] ?? 
                'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png',
            'bio': response['bio'] ?? '',
            'location': response['location'] ?? '',
          };
          await ApiService.saveUserData(userData);
        }
        return response;
      } else {
        throw Exception(response['message'] ?? 'Registration failed');
      }
    } catch (e) {
      print('❌ Registration error: $e');
      throw Exception('Registration failed: $e');
    }
  }

  // Logout user
  static Future<void> logout() async {
    try {
      // ✅ Clear local data
      await ApiService.deleteToken();
      print('✅ Logged out successfully');
    } catch (e) {
      print('❌ Logout error: $e');
      // Always clear local data even if API fails
      await ApiService.deleteToken();
    }
  }

  // Update user profile
  static Future<Map<String, dynamic>> updateProfile({
    String? fullName,
    String? phone,
    String? bio,
    String? location,
    Map<String, dynamic>? additionalData,
  }) async {
    try {
      final data = {
        if (fullName != null) 'fullName': fullName,
        if (phone != null) 'phone': phone,
        if (bio != null) 'bio': bio,
        if (location != null) 'location': location,
        ...?additionalData,
      };

      final response = await ApiService.putWithToken(ApiConstants.profile, data);

      if (response['success'] == true && response['user'] != null) {
        // Update stored user data
        await ApiService.saveUserData(response['user']);
      }

      return response;
    } catch (e) {
      print('❌ Update profile error: $e');
      throw Exception('Profile update failed: $e');
    }
  }

  // Change password
  static Future<Map<String, dynamic>> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      final response = await ApiService.postWithToken(
        ApiConstants.changePassword,
        {
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        },
      );
      return response;
    } catch (e) {
      print('❌ Change password error: $e');
      throw Exception('Password change failed: $e');
    }
  }

  // Forgot password
  static Future<Map<String, dynamic>> forgotPassword(String email) async {
    try {
      final response = await ApiService.post(
        ApiConstants.forgotPassword,
        {'email': email},
      );
      return response;
    } catch (e) {
      print('❌ Forgot password error: $e');
      throw Exception('Password reset request failed: $e');
    }
  }

  // Reset password
  static Future<Map<String, dynamic>> resetPassword({
    required String email,
    required String otp,
    required String newPassword,
  }) async {
    try {
      final response = await ApiService.post(
        ApiConstants.resetPassword,
        {
          'email': email,
          'otp': otp,
          'newPassword': newPassword,
        },
      );
      return response;
    } catch (e) {
      print('❌ Reset password error: $e');
      throw Exception('Password reset failed: $e');
    }
  }

  // ✅ Verify Email (using OTP)
  static Future<Map<String, dynamic>> verifyEmail({
    required String email,
    required String otp,
  }) async {
    try {
      final response = await ApiService.post(
        ApiConstants.verifyOTP,
        {
          'email': email,
          'otp': otp,
        },
      );
      return response;
    } catch (e) {
      print('❌ Verify email error: $e');
      throw Exception('Email verification failed: $e');
    }
  }

  // ✅ Resend Verification email
  static Future<Map<String, dynamic>> resendVerification(String email) async {
    try {
      final response = await ApiService.post(
        ApiConstants.resendOTP,
        {'email': email},
      );
      return response;
    } catch (e) {
      print('❌ Resend verification error: $e');
      throw Exception('Failed to resend verification: $e');
    }
  }

  // ✅ Google authentication
  static Future<Map<String, dynamic>> googleAuth({
    required String idToken,
    required String platform,
  }) async {
    try {
      final response = await ApiService.post(
        ApiConstants.googleAuth,
        {
          'idToken': idToken,
          'platform': platform,
        },
      );

      if (response['success'] == true) {
        if (response['token'] != null) {
          await ApiService.saveToken(response['token']);
        }
        if (response['user'] != null) {
          await ApiService.saveUserData(response['user']);
        }
        return response;
      } else {
        throw Exception(response['message'] ?? 'Google authentication failed');
      }
    } catch (e) {
      print('❌ Google auth error: $e');
      throw Exception('Google authentication failed: $e');
    }
  }

  // ✅ Send OTP for registration
  static Future<Map<String, dynamic>> sendOTP(String email) async {
    try {
      final response = await ApiService.post(
        ApiConstants.sendOTP,
        {'email': email},
      );
      return response;
    } catch (e) {
      print('❌ Send OTP error: $e');
      throw Exception('Failed to send OTP: $e');
    }
  }

  // ✅ Verify OTP for registration
  static Future<Map<String, dynamic>> verifyOTP({
    required String email,
    required String otp,
  }) async {
    try {
      final response = await ApiService.post(
        ApiConstants.verifyOTP,
        {
          'email': email,
          'otp': otp,
        },
      );
      return response;
    } catch (e) {
      print('❌ Verify OTP error: $e');
      throw Exception('OTP verification failed: $e');
    }
  }

  // ✅ Resend OTP
  static Future<Map<String, dynamic>> resendOTP(String email) async {
    try {
      final response = await ApiService.post(
        ApiConstants.resendOTP,
        {'email': email},
      );
      return response;
    } catch (e) {
      print('❌ Resend OTP error: $e');
      throw Exception('Failed to resend OTP: $e');
    }
  }
}