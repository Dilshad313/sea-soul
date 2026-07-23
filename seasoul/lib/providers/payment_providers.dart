// lib/providers/payment_provider.dart
import 'package:flutter/material.dart';
import '../services/payment_service.dart';

class PaymentProvider extends ChangeNotifier {
  final PaymentService _paymentService = PaymentService();
  
  bool _isProcessing = false;
  String? _error;
  Map<String, dynamic>? _paymentData;

  bool get isProcessing => _isProcessing;
  String? get error => _error;
  Map<String, dynamic>? get paymentData => _paymentData;

  Future<bool> makePayment({
    required int amount,
    required String currency,
    required String receipt,
    required String bookingId,
    required Map<String, String> prefill,
  }) async {
    _isProcessing = true;
    _error = null;
    notifyListeners();

    try {
      bool paymentCompleted = false;
      
      await _paymentService.initiatePayment(
        amount: amount,
        currency: currency,
        receipt: receipt,
        bookingId: bookingId,
        onSuccess: (data) async {
          try {
            // Verify payment on backend
            final result = await _paymentService.verifyPayment(
              orderId: data['orderId'],
              paymentId: data['paymentId'],
              signature: data['signature'],
              bookingId: bookingId,
              amount: amount.toDouble(),
            );
            
            _paymentData = result;
            paymentCompleted = true;
            _isProcessing = false;
            notifyListeners();
          } catch (e) {
            _error = e.toString();
            _isProcessing = false;
            notifyListeners();
          }
        },
        onError: (error) {
          _error = error;
          _isProcessing = false;
          notifyListeners();
        },
        prefill: prefill,
      );

      // If payment failed or was cancelled
      if (!paymentCompleted && _error == null) {
        _isProcessing = false;
        notifyListeners();
        return false;
      }

      return paymentCompleted;
    } catch (e) {
      _error = e.toString();
      _isProcessing = false;
      notifyListeners();
      return false;
    }
  }

  void reset() {
    _isProcessing = false;
    _error = null;
    _paymentData = null;
    notifyListeners();
  }

  @override
  void dispose() {
    _paymentService.dispose();
    super.dispose();
  }
}