import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:razorpay_flutter/razorpay_flutter.dart';
import '../constants/api_constants.dart';
import '../services/api_service.dart';

class RazorpayService {
  static final Razorpay _razorpay = Razorpay();
  
  // Event callbacks
  static Function(PaymentSuccessResponse)? onSuccess;
  static Function(PaymentFailureResponse)? onError;
  static Function(ExternalWalletResponse)? onExternalWallet;

  // Initialize Razorpay with callbacks
  static void initialize({
    required Function(PaymentSuccessResponse) successCallback,
    required Function(PaymentFailureResponse) errorCallback,
    Function(ExternalWalletResponse)? externalWalletCallback,
  }) {
    onSuccess = successCallback;
    onError = errorCallback;
    onExternalWallet = externalWalletCallback;

    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handleSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handleError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
  }

  static void _handleSuccess(PaymentSuccessResponse response) {
    if (onSuccess != null) {
      onSuccess!(response);
    }
  }

  static void _handleError(PaymentFailureResponse response) {
    if (onError != null) {
      onError!(response);
    }
  }

  static void _handleExternalWallet(ExternalWalletResponse response) {
    if (onExternalWallet != null) {
      onExternalWallet!(response);
    }
  }

  // Create Razorpay order on backend with better error handling
  static Future<Map<String, dynamic>> createOrder({
    required double amount,
    required String receipt,
    String currency = 'INR',
    Map<String, dynamic>? notes,
  }) async {
    try {
      final token = await ApiService.getToken();
      
      if (token == null || token.isEmpty) {
        throw Exception('User not authenticated. Please login again.');
      }

      final url = ApiConstants.razorpayCreateOrder;
      print('📤 Creating Razorpay order at: $url');
      print('📤 Amount: $amount, Receipt: $receipt');

      final response = await http.post(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'amount': amount,
          'currency': currency,
          'receipt': receipt,
          'notes': notes ?? {},
        }),
      ).timeout(const Duration(seconds: 30));

      print('📥 Response Status: ${response.statusCode}');
      print('📥 Response Body: ${response.body}');

      if (response.body.isEmpty) {
        throw Exception('Empty response from server');
      }

      if (response.body.startsWith('<!DOCTYPE') || response.body.startsWith('<html')) {
        throw Exception('API endpoint returned HTML. Please check backend URL.');
      }

      if (response.statusCode == 200 || response.statusCode == 201) {
        final Map<String, dynamic> responseData = jsonDecode(response.body);
        
        // Check if we got a valid Razorpay order
        if (responseData.containsKey('id') && responseData['id'] != null) {
          print('✅ Order created successfully: ${responseData['id']}');
          return responseData;
        } else if (responseData.containsKey('success') && responseData['success'] == true) {
          // If response is wrapped in success wrapper
          if (responseData.containsKey('order') && responseData['order'] != null) {
            return responseData['order'];
          }
        }
        
        throw Exception('Invalid response format: ${response.body}');
      } else {
        Map<String, dynamic> errorData;
        try {
          errorData = jsonDecode(response.body);
        } catch (e) {
          throw Exception('Server error: ${response.statusCode}');
        }
        throw Exception(errorData['error'] ?? errorData['message'] ?? 'Failed to create order');
      }
    } catch (e) {
      print('❌ Failed to create order: $e');
      if (e is Exception) rethrow;
      throw Exception('Failed to create order: $e');
    }
  }

  // Open Razorpay checkout
  static Future<void> openCheckout({
    required String keyId,
    required String orderId,
    required double amount,
    required String receipt,
    required String itemName,
    String? customerName,
    String? customerEmail,
    String? customerContact,
    Map<String, dynamic>? prefillData,
  }) async {
    try {
      var options = {
        'key': keyId,
        'amount': (amount * 100).toInt(), // Convert to paise
        'name': 'Sea Soul',
        'description': 'Payment for $itemName',
        'order_id': orderId,
        'prefill': {
          'contact': customerContact ?? '9999999999',
          'email': customerEmail ?? 'customer@example.com',
          'name': customerName ?? 'Customer',
        },
        'theme': {
          'color': '#0099CC',
        },
        'modal': {
          'confirm_close': true,
          'escape': true,
        },
        'notes': {
          'receipt': receipt,
          'order_id': orderId,
        },
        'retry': {
          'enabled': true,
          'max_count': 3,
        },
      };

      print('📤 Opening Razorpay checkout');
      print('📤 Key ID: $keyId');
      print('📤 Order ID: $orderId');
      print('📤 Amount: ${(amount * 100).toInt()} paise');

      _razorpay.open(options);
    } catch (e) {
      print('❌ Failed to open checkout: $e');
      throw Exception('Failed to open checkout: $e');
    }
  }

  // Verify payment signature
  static Future<bool> verifyPayment({
    required String orderId,
    required String paymentId,
    required String signature,
  }) async {
    try {
      final token = await ApiService.getToken();
      
      if (token == null || token.isEmpty) {
        throw Exception('User not authenticated');
      }

      final response = await http.post(
        Uri.parse(ApiConstants.razorpayVerifyPayment),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'razorpay_order_id': orderId,
          'razorpay_payment_id': paymentId,
          'razorpay_signature': signature,
        }),
      ).timeout(const Duration(seconds: 30));

      print('📤 Verify Payment');
      print('📥 Response Status: ${response.statusCode}');
      print('📥 Response Body: ${response.body}');

      if (response.body.isEmpty) {
        print('❌ Empty response from server');
        return false;
      }

      if (response.body.startsWith('<!DOCTYPE') || response.body.startsWith('<html')) {
        print('❌ Received HTML instead of JSON');
        return false;
      }

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = jsonDecode(response.body);
        return responseData['success'] ?? false;
      } else {
        return false;
      }
    } catch (e) {
      print('❌ Payment verification failed: $e');
      return false;
    }
  }

  // Get Razorpay key from backend
  static Future<String> getRazorpayKey() async {
    try {
      final token = await ApiService.getToken();
      
      if (token == null || token.isEmpty) {
        throw Exception('User not authenticated');
      }

      final response = await http.get(
        Uri.parse(ApiConstants.razorpayGetKey),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 30));

      print('📤 Get Razorpay Key');
      print('📥 Response Status: ${response.statusCode}');
      print('📥 Response Body: ${response.body}');

      if (response.body.isEmpty) {
        throw Exception('Empty response from server');
      }

      if (response.body.startsWith('<!DOCTYPE') || response.body.startsWith('<html')) {
        throw Exception('API endpoint not found. Please check your backend URL.');
      }

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = jsonDecode(response.body);
        
        // Check for key in different response formats
        if (responseData.containsKey('key_id')) {
          return responseData['key_id'];
        } else if (responseData.containsKey('key')) {
          return responseData['key'];
        } else if (responseData.containsKey('razorpayKeyId')) {
          return responseData['razorpayKeyId'];
        } else {
          throw Exception('Key not found in response: ${response.body}');
        }
      } else {
        throw Exception('Failed to get Razorpay key: ${response.statusCode}');
      }
    } catch (e) {
      print('❌ Failed to get Razorpay key: $e');
      throw Exception('Failed to get payment key: $e');
    }
  }

  // Dispose Razorpay
  static void dispose() {
    _razorpay.clear();
  }
}