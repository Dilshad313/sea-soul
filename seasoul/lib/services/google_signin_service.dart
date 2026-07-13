import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'dart:convert';

import 'origin_helper.dart' if (dart.library.html) 'origin_helper_web.dart';

class GoogleSignInService {
  // ✅ Your Actual Client IDs - Replace with yours
  static const String _androidClientId =
      '982762507474-cns94029a218jbghi6sagk118igk49pr.apps.googleusercontent.com';

  static const String _webClientId =
      '982762507474-6blv3lmb1s32akhth9fv3kg2fa38betr.apps.googleusercontent.com';

  static String get _clientId {
    if (kIsWeb) {
      return _webClientId;
    } else {
      return _androidClientId;
    }
  }

  // ✅ Get Backend URL based on platform
  static String get _backendUrl {
    if (kIsWeb) {
      return 'http://localhost:5000';
    } else {
      return 'http://10.0.2.2:5000';
    }
  }

  // ✅ Get current website URL (Web Only)
  static String get _currentOrigin {
    if (kIsWeb) {
      return getOrigin();
    }
    return '';
  }

  static GoogleSignIn get _googleSignIn {
    if (kIsWeb) {
      return GoogleSignIn(
        clientId: _clientId,
        scopes: ['email', 'profile', 'openid'],
        hostedDomain: '',
        signInOption: SignInOption.standard,
      );
    } else {
      return GoogleSignIn(
        clientId: _clientId,
        scopes: ['email', 'profile', 'openid'],
      );
    }
  }

  // ✅ Main Sign-In Method
  static Future<Map<String, dynamic>?> signInWithBackend() async {
    try {
      print('🔐 Starting Google Sign-In...');
      print('📱 Platform: ${kIsWeb ? "Web" : "Mobile"}');
      print('📱 Client ID: $_clientId');
      print('📱 Backend URL: $_backendUrl');
      
      if (kIsWeb) {
        print('📍 Current Origin: $_currentOrigin');
        print('⚠️ Make sure this URL is added to Google Cloud Console:');
        print('   → Authorized JavaScript origins: $_currentOrigin');
        print('   → Authorized redirect URIs: $_currentOrigin/auth/google/callback');
      }

      final GoogleSignIn googleSignIn = _googleSignIn;

      GoogleSignInAccount? googleUser;

      if (kIsWeb) {
        // ✅ WEB: Try silent sign-in first
        try {
          print('📱 Web: Trying silent sign-in...');
          googleUser = await googleSignIn.signInSilently();
          if (googleUser != null) {
            print('✅ Web: Silent sign-in successful');
          }
        } catch (e) {
          print('⚠️ Web: Silent sign-in failed: $e');
        }

        // ✅ If no user, show popup
        if (googleUser == null) {
          print('📱 Web: Showing sign-in popup...');
          
          try {
            googleUser = await googleSignIn.signIn();
          } catch (popupError) {
            print('❌ Web: Popup sign-in error: $popupError');
            
            if (popupError.toString().contains('popup_closed')) {
              print('⚠️ Popup was closed by user - This is normal');
              return null;
            }
            
            if (popupError.toString().contains('origin_mismatch')) {
              print('❌ ERROR: origin_mismatch');
              print('⚠️ Your current URL: $_currentOrigin');
              print('⚠️ Add this URL to Google Cloud Console:');
              print('   → https://console.cloud.google.com/apis/credentials');
              print('   → Authorized JavaScript origins: $_currentOrigin');
              print('   → Authorized redirect URIs: $_currentOrigin/auth/google/callback');
              return null;
            }
            
            if (popupError.toString().contains('invalid_client')) {
              print('❌ ERROR: invalid_client');
              print('⚠️ Your Web Client ID: $_webClientId');
              print('⚠️ Make sure this Client ID is correct in Google Cloud Console');
              return null;
            }
            
            return null;
          }
        }
      } else {
        // ✅ MOBILE: Normal sign-in
        googleUser = await googleSignIn.signIn();
      }

      if (googleUser == null) {
        print('❌ User cancelled sign-in');
        return null;
      }

      // ✅ Get authentication
      final GoogleSignInAuthentication googleAuth =
          await googleUser.authentication;

      final idToken = googleAuth.idToken;
      if (idToken == null) {
        print('❌ No ID token received');
        return null;
      }

      print('✅ Google Sign-In successful!');
      print('📧 Email: ${googleUser.email}');
      print('👤 Name: ${googleUser.displayName}');

      // ✅ Send to Backend
      final platform = kIsWeb ? 'web' : 'mobile';

      final response = await http.post(
        Uri.parse('$_backendUrl/api/auth/google'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'idToken': idToken,
          'platform': platform,
        }),
      );

      print('📥 Backend Response Status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          return {
            'id': googleUser.id,
            'email': googleUser.email,
            'fullName': googleUser.displayName ?? 'User',
            'profileImage': googleUser.photoUrl ?? '',
            'idToken': idToken,
            'accessToken': googleAuth.accessToken,
            'token': data['token'],
            'user': data['user'],
          };
        } else {
          print('❌ Backend authentication failed: ${data['message']}');
          return null;
        }
      } else {
        print('❌ Backend error: ${response.body}');
        return null;
      }
    } catch (error) {
      print('❌ Google Sign-In Error: $error');
      return null;
    }
  }

  // ✅ Sign-Out
  static Future<void> signOut() async {
    try {
      await _googleSignIn.signOut();
      print('✅ Signed out from Google');
    } catch (e) {
      print('❌ Error signing out: $e');
    }
  }

  // ✅ Disconnect
  static Future<void> disconnect() async {
    try {
      await _googleSignIn.disconnect();
      print('✅ Disconnected from Google');
    } catch (e) {
      print('❌ Error disconnecting: $e');
    }
  }

  // ✅ Check if user is signed in
  static Future<bool> isSignedIn() async {
    try {
      final account = _googleSignIn.currentUser;
      if (account != null) return true;

      if (kIsWeb) {
        try {
          final cachedUser = await _googleSignIn.signInSilently();
          return cachedUser != null;
        } catch (e) {
          return false;
        }
      }
      return false;
    } catch (e) {
      print('❌ Error checking sign in status: $e');
      return false;
    }
  }

  // ✅ Get current user
  static GoogleSignInAccount? getCurrentUser() {
    return _googleSignIn.currentUser;
  }

  // ✅ Clear cache
  static Future<void> clearCache() async {
    try {
      await _googleSignIn.signOut();
      await Future.delayed(const Duration(milliseconds: 500));
      print('✅ Google Sign-In cache cleared');
    } catch (e) {
      print('❌ Error clearing cache: $e');
    }
  }
}