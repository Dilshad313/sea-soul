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
          'email': email,
          'password': password,
        },
      );

      if (response['success'] == true) {
        // Save token and user data
        if (response['token'] != null) {
          await ApiService.saveToken(response['token']);
        }
        if (response['user'] != null) {
          await ApiService.saveUserData(response['user']);
        }
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
    required String name,
    required String email,
    required String password,
    required String phone,
  }) async {
    try {
      final response = await ApiService.post(
        ApiConstants.register,
        {
          'name': name,
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
        if (response['user'] != null) {
          await ApiService.saveUserData(response['user']);
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
      // Call logout API if needed
      await ApiService.postWithToken(ApiConstants.logout, {});
    } catch (e) {
      print('❌ Logout API error: $e');
    } finally {
      // Always clear local data
      await ApiService.deleteToken();
    }
  }

  // Update user profile
  static Future<Map<String, dynamic>> updateProfile({
    String? name,
    String? email,
    String? phone,
    Map<String, dynamic>? additionalData,
  }) async {
    try {
      final data = {
        if (name != null) 'name': name,
        if (email != null) 'email': email,
        if (phone != null) 'phone': phone,
        ...?additionalData,
      };

      final response = await ApiService.updateProfile(data);

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
      return await ApiService.postWithToken(
        ApiConstants.changePassword,
        {
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        },
      );
    } catch (e) {
      print('❌ Change password error: $e');
      throw Exception('Password change failed: $e');
    }
  }

  // Forgot password
  static Future<Map<String, dynamic>> forgotPassword(String email) async {
    try {
      return await ApiService.post(
        ApiConstants.forgotPassword,
        {'email': email},
      );
    } catch (e) {
      print('❌ Forgot password error: $e');
      throw Exception('Password reset request failed: $e');
    }
  }

  // Reset password
  static Future<Map<String, dynamic>> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    try {
      return await ApiService.post(
        ApiConstants.resetPassword,
        {
          'token': token,
          'newPassword': newPassword,
        },
      );
    } catch (e) {
      print('❌ Reset password error: $e');
      throw Exception('Password reset failed: $e');
    }
  }

  // Verify email
  static Future<Map<String, dynamic>> verifyEmail(String token) async {
    try {
      return await ApiService.post(
        ApiConstants.verifyEmail,
        {'token': token},
      );
    } catch (e) {
      print('❌ Verify email error: $e');
      throw Exception('Email verification failed: $e');
    }
  }

  // Resend verification email
  static Future<Map<String, dynamic>> resendVerification(String email) async {
    try {
      return await ApiService.post(
        ApiConstants.resendVerification,
        {'email': email},
      );
    } catch (e) {
      print('❌ Resend verification error: $e');
      throw Exception('Failed to resend verification: $e');
    }
  }

  // Google authentication
  static Future<Map<String, dynamic>> googleAuth(String token) async {
    try {
      final response = await ApiService.post(
        ApiConstants.googleAuth,
        {'token': token},
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
}