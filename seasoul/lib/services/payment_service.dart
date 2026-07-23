// lib/services/payment_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:razorpay_flutter/razorpay_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/api_constants.dart';

class PaymentService {
  final Razorpay _razorpay = Razorpay();

  String? _pendingBookingId;
  double? _pendingAmount;

  Function(Map<String, dynamic>)? _onSuccess;
  Function(String)? _onError;

  PaymentService() {
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
  }

  Future<String> getRazorpayKey() async {
    try {
      final token = await _getAuthToken();

      final response = await http.get(
        Uri.parse(ApiConstants.razorpayGetKey),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to get Razorpay key');
      }

      final data = jsonDecode(response.body);

      if (!data['success']) {
        throw Exception(data['message'] ?? 'Failed to get key');
      }

      return data['key_id'];
    } catch (e) {
      throw Exception('Error getting Razorpay key: $e');
    }
  }

  Future<Map<String, dynamic>> createOrder({
    required int amount,
    required String currency,
    required String receipt,
    Map<String, String>? notes,
  }) async {
    try {
      final token = await _getAuthToken();

      final response = await http.post(
        Uri.parse(ApiConstants.razorpayCreateOrder),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'amount': amount,
          'currency': currency,
          'receipt': receipt,
          'notes': notes ?? {},
        }),
      );

      if (response.statusCode != 200) {
        final errorData = jsonDecode(response.body);
        throw Exception(errorData['message'] ?? 'Failed to create order');
      }

      final data = jsonDecode(response.body);

      if (!data['success']) {
        throw Exception(data['message'] ?? 'Order creation failed');
      }

      return data;
    } catch (e) {
      throw Exception('Error creating order: $e');
    }
  }

  Future<Map<String, dynamic>> verifyPayment({
    required String orderId,
    required String paymentId,
    required String signature,
    required String bookingId,
    required double amount,
  }) async {
    try {
      final token = await _getAuthToken();

      final response = await http.post(
        Uri.parse(ApiConstants.razorpayVerifyPayment),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'razorpay_order_id': orderId,
          'razorpay_payment_id': paymentId,
          'razorpay_signature': signature,
          'bookingId': bookingId,
          'amount': amount,
        }),
      );

      if (response.statusCode != 200) {
        final errorData = jsonDecode(response.body);
        throw Exception(errorData['message'] ?? 'Payment verification failed');
      }

      final data = jsonDecode(response.body);

      if (!data['success']) {
        throw Exception(data['message'] ?? 'Verification failed');
      }

      return data;
    } catch (e) {
      throw Exception('Error verifying payment: $e');
    }
  }

  Future<void> initiatePayment({
    required int amount,
    required String currency,
    required String receipt,
    required String bookingId,
    required Function(Map<String, dynamic>) onSuccess,
    required Function(String) onError,
    Map<String, String>? prefill,
  }) async {
    try {
      _onSuccess = onSuccess;
      _onError = onError;
      _pendingBookingId = bookingId;
      _pendingAmount = amount.toDouble();

      final keyId = await getRazorpayKey();

      final orderData = await createOrder(
        amount: amount,
        currency: currency,
        receipt: receipt,
      );

      final options = {
        'key': keyId,
        'amount': amount * 100, // amount in paise
        'name': 'SeaSoul',
        'description': 'Payment for booking',
        'order_id': orderData['id'],

        // ✅ Add UPI Intent Flow for mobile apps
        'method': 'upi',
        '_[flow]': 'intent', // Critical for mobile apps
        'upi_app_package_name':
            'com.google.android.apps.nbu.paisa.user', // For Google Pay

        'prefill': {
          'contact': prefill?['contact'] ?? '',
          'email': prefill?['email'] ?? '',
        },
        'theme': {'color': '#0099CC'},
        'modal': {'backdrop_color': '#1A2B49'},
      };
      _razorpay.open(options);
    } catch (e) {
      onError(e.toString());
    }
  }

  void _handlePaymentSuccess(PaymentSuccessResponse response) async {
    print('✅ Payment Success: ${response.paymentId}');

    try {
      if (_pendingBookingId == null) {
        throw Exception('No pending booking found');
      }

      final verificationResult = await verifyPayment(
        orderId: response.orderId!,
        paymentId: response.paymentId!,
        signature: response.signature!,
        bookingId: _pendingBookingId!,
        amount: _pendingAmount ?? 0,
      );

      _onSuccess?.call({
        'paymentId': response.paymentId,
        'orderId': response.orderId,
        'signature': response.signature,
        'verification': verificationResult,
        'bookingId': _pendingBookingId,
      });

      _pendingBookingId = null;
      _pendingAmount = null;
    } catch (e) {
      print('❌ Verification error: $e');
      _onError?.call('Payment verification failed: $e');
    }
  }

  void _handlePaymentError(PaymentFailureResponse response) {
    print('❌ Payment Error: ${response.message}');
    _onError?.call(response.message ?? 'Payment failed');
    _pendingBookingId = null;
    _pendingAmount = null;
  }

  void _handleExternalWallet(ExternalWalletResponse response) {
    print('💳 External Wallet: ${response.walletName}');
  }

  Future<String> _getAuthToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    if (token == null) {
      throw Exception('User not authenticated');
    }
    return token;
  }

  void dispose() {
    _razorpay.clear();
  }
}
