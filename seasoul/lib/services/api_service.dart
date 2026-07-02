import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/api_constants.dart';
import 'package:flutter/foundation.dart' show kIsWeb;

class ApiService {
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user_data';

  // ==================== TOKEN MANAGEMENT ====================

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    print('✅ Token saved: $token');
  }

  static Future<void> saveUserData(Map<String, dynamic> userData) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_userKey, jsonEncode(userData));
    print('✅ User data saved');
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_tokenKey);
    print('📤 Token retrieved: ${token != null ? 'Yes' : 'No'}');
    return token;
  }

  static Future<Map<String, dynamic>?> getUserData() async {
    final prefs = await SharedPreferences.getInstance();
    final userDataString = prefs.getString(_userKey);
    if (userDataString != null) {
      try {
        return jsonDecode(userDataString);
      } catch (e) {
        print('❌ Error parsing user data: $e');
        return null;
      }
    }
    return null;
  }

  static Future<void> deleteToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
    print('✅ Token and user data deleted');
  }

  static Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  // ==================== HTTP METHODS ====================

  static Future<Map<String, dynamic>> post(String url, Map<String, dynamic> data) async {
    try {
      final response = await http.post(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(data),
      );

      print('📤 POST Request: $url');
      print('📤 Data: $data');
      print('📥 Response Status: ${response.statusCode}');
      print('📥 Response Body: ${response.body}');

      final Map<String, dynamic> responseData = jsonDecode(response.body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        return responseData;
      } else {
        throw Exception(responseData['message'] ?? 'Something went wrong');
      }
    } catch (e) {
      print('❌ Network Error: $e');
      throw Exception('Network Error: $e');
    }
  }

  static Future<Map<String, dynamic>> get(String url) async {
    try {
      final token = await getToken();
      
      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      print('📤 GET Request: $url');
      print('📥 Response Status: ${response.statusCode}');
      print('📥 Response Body: ${response.body}');

      final Map<String, dynamic> responseData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return responseData;
      } else {
        throw Exception(responseData['message'] ?? 'Something went wrong');
      }
    } catch (e) {
      print('❌ Network Error: $e');
      throw Exception('Network Error: $e');
    }
  }

  static Future<Map<String, dynamic>> put(String url, Map<String, dynamic> data) async {
    try {
      final token = await getToken();
      
      final response = await http.put(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(data),
      );

      print('📤 PUT Request: $url');
      print('📤 Data: $data');
      print('📥 Response Status: ${response.statusCode}');
      print('📥 Response Body: ${response.body}');

      final Map<String, dynamic> responseData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return responseData;
      } else {
        throw Exception(responseData['message'] ?? 'Something went wrong');
      }
    } catch (e) {
      print('❌ Network Error: $e');
      throw Exception('Network Error: $e');
    }
  }

  static Future<Map<String, dynamic>> delete(String url) async {
    try {
      final token = await getToken();
      
      final response = await http.delete(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      print('📤 DELETE Request: $url');
      print('📥 Response Status: ${response.statusCode}');
      print('📥 Response Body: ${response.body}');

      final Map<String, dynamic> responseData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return responseData;
      } else {
        throw Exception(responseData['message'] ?? 'Something went wrong');
      }
    } catch (e) {
      print('❌ Network Error: $e');
      throw Exception('Network Error: $e');
    }
  }

  static Future<Map<String, dynamic>> postWithToken(String url, Map<String, dynamic> data) async {
    try {
      final token = await getToken();
      
      final response = await http.post(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(data),
      );

      print('📤 POST Request with Token: $url');
      print('📤 Data: $data');
      print('📥 Response Status: ${response.statusCode}');
      print('📥 Response Body: ${response.body}');

      final Map<String, dynamic> responseData = jsonDecode(response.body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        return responseData;
      } else {
        throw Exception(responseData['message'] ?? 'Something went wrong');
      }
    } catch (e) {
      print('❌ Network Error: $e');
      throw Exception('Network Error: $e');
    }
  }

  // ==================== IMAGE UPLOAD (Web + Mobile) ====================

  static Future<Map<String, dynamic>> uploadImage(String url, String filePath) async {
    try {
      final token = await getToken();
      
      // For Web: Use multipart request with proper filename and content type
      if (kIsWeb) {
        print('🌐 Uploading from Web');
        print('📤 File path: $filePath');
        
        // For web, filePath is a blob URL
        final bytes = await http.readBytes(Uri.parse(filePath));
        print('📤 File size: ${bytes.length} bytes');
        
        final request = http.MultipartRequest('POST', Uri.parse(url));
        request.headers['Authorization'] = 'Bearer $token';
        
        // Determine file extension and content type
        String filename = 'profile_image.jpg';
        String contentType = 'image/jpeg';
        
        // Try to determine from filePath
        if (filePath.contains('data:image/png')) {
          filename = 'profile_image.png';
          contentType = 'image/png';
        } else if (filePath.contains('data:image/gif')) {
          filename = 'profile_image.gif';
          contentType = 'image/gif';
        } else if (filePath.contains('data:image/webp')) {
          filename = 'profile_image.webp';
          contentType = 'image/webp';
        }
        
        // If it's a blob URL, try to get extension from path
        if (filePath.startsWith('blob:')) {
          // Default to jpg for blob URLs
          filename = 'profile_image.jpg';
          contentType = 'image/jpeg';
        }
        
        print('📤 Filename: $filename');
        print('📤 Content-Type: $contentType');
        
        request.files.add(
          http.MultipartFile.fromBytes(
            'image',
            bytes,
            filename: filename,
            contentType: http.MediaType.parse(contentType),
          ),
        );
        
        final response = await request.send();
        final responseData = await response.stream.bytesToString();
        
        print('📤 Upload Response Status: ${response.statusCode}');
        print('📥 Upload Response: $responseData');
        
        if (response.statusCode == 200 || response.statusCode == 201) {
          return jsonDecode(responseData);
        } else {
          final jsonError = jsonDecode(responseData);
          throw Exception(jsonError['message'] ?? 'Upload failed');
        }
      } else {
        // For Mobile: Use file path
        print('📱 Uploading from Mobile');
        print('📤 File path: $filePath');
        
        final request = http.MultipartRequest('POST', Uri.parse(url));
        request.headers['Authorization'] = 'Bearer $token';
        request.files.add(await http.MultipartFile.fromPath('image', filePath));
        
        final response = await request.send();
        final responseData = await response.stream.bytesToString();
        final jsonResponse = jsonDecode(responseData);
        
        print('📤 Upload Response Status: ${response.statusCode}');
        print('📥 Upload Response: $jsonResponse');
        
        if (response.statusCode == 200 || response.statusCode == 201) {
          return jsonResponse;
        } else {
          throw Exception(jsonResponse['message'] ?? 'Upload failed');
        }
      }
    } catch (e) {
      print('❌ Upload Error: $e');
      throw Exception('Upload Error: $e');
    }
  }

  // ==================== PROFILE METHODS ====================

  static Future<Map<String, dynamic>> getProfile() async {
    return await get(ApiConstants.profile);
  }

  static Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    return await put(ApiConstants.profile, data);
  }

  static Future<Map<String, dynamic>> uploadProfileImage(String filePath) async {
    return await uploadImage(ApiConstants.uploadProfileImage, filePath);
  }

  static Future<Map<String, dynamic>> deleteProfileImage() async {
    return await delete(ApiConstants.deleteProfileImage);
  }
}