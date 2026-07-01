import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/api_constants.dart';

class ApiService {
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user_data';

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
      return jsonDecode(userDataString);
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
}