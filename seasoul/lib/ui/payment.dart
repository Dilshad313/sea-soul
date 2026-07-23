// lib/ui/payment.dart
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:seasoul/services/api_service.dart';
import 'package:seasoul/services/auth_services.dart';
import 'package:seasoul/constants/api_constants.dart';
import 'package:seasoul/services/razorpay_services.dart';
import 'package:seasoul/ui/payment_succes.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';

class payment extends StatefulWidget {
  final String? productId;
  final String? activityId;
  final String itemName;
  final String itemType;
  final double amount;
  final String? bookingId;
  final String itemImage;

  const payment({
    super.key,
    this.productId,
    this.activityId,
    this.itemName = 'Package',
    this.itemType = 'product',
    this.amount = 0,
    this.bookingId,
    this.itemImage = '',
  });

  @override
  State<payment> createState() => _paymentState();
}

class _paymentState extends State<payment> {
  bool _isProcessing = false;
  bool _isSuccess = false;
  String? _razorpayOrderId;
  String? _createdBookingId;
  String? _paymentId;
  String? _errorMessage;

  static const Color deepNavy = Color(0xFF1A2B49);
  static const Color oceanBlue = Color(0xFF0099CC);
  static const Color turquoiseLagoon = Color(0xFF00C2A8);
  static const Color sunsetOrange = Color(0xFFFFB84D);
  static const Color outline = Color(0xFF6E7880);
  static const Color sandWhite = Color(0xFFF8FBFF);

  @override
  void initState() {
    super.initState();
    _initializeRazorpay();
  }

  void _initializeRazorpay() {
    RazorpayService.initialize(
      successCallback: _handlePaymentSuccess,
      errorCallback: _handlePaymentError,
      externalWalletCallback: _handleExternalWallet,
    );
  }

  void _handlePaymentSuccess(PaymentSuccessResponse response) async {
    print('✅ Payment Success: ${response.paymentId}');

    setState(() {
      _isProcessing = false;
      _paymentId = response.paymentId;
    });

    // Retrieve stored bookingId from service static fields
    final String? bookingId =
        _createdBookingId ?? RazorpayService.pendingBookingId ?? widget.bookingId;
    final double? amount = RazorpayService.pendingAmount ?? widget.amount;

    try {
      // Verify payment on backend — pass bookingId + amount
      final isVerified = await RazorpayService.verifyPayment(
        orderId: response.orderId!,
        paymentId: response.paymentId!,
        signature: response.signature!,
        bookingId: bookingId,
        amount: amount,
      );

      if (isVerified) {
        // Update booking with payment
        await _updateBookingWithPayment(response.paymentId!);
      } else {
        _showErrorDialog(
          'Payment verification failed. Please contact support.',
        );
        setState(() => _isProcessing = false);
      }
    } catch (e) {
      print('❌ Payment verification error: $e');
      _showErrorDialog('Error verifying payment: $e');
      setState(() => _isProcessing = false);
    }
  }

  void _handlePaymentError(PaymentFailureResponse response) {
    print('❌ Payment Error: ${response.message}');
    setState(() {
      _isProcessing = false;
      _errorMessage = response.message ?? 'Payment failed';
    });
    _showErrorDialog('Payment failed: ${response.message}');
  }

  void _handleExternalWallet(ExternalWalletResponse response) {
    print('External Wallet: ${response.walletName}');
  }

  Future<void> _updateBookingWithPayment(String paymentId) async {
    try {
      String? bookingId = _createdBookingId ?? widget.bookingId;

      if (bookingId != null) {
        // Update booking with payment ID
        final updateResponse = await ApiService.putWithToken(
          '${ApiConstants.baseUrl}/api/bookings/$bookingId',
          {
            'paymentId': paymentId,
            'paymentStatus': 'completed',
            'status': 'confirmed',
          },
        );

        if (updateResponse['success'] != true) {
          print('⚠️ Warning: Could not update booking payment status');
        }
      }

      setState(() {
        _isSuccess = true;
        _isProcessing = false;
      });

      // Navigate to success screen
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => payment_success(
              bookingId: bookingId ?? '',
              productId: widget.productId,
              activityId: widget.activityId,
              itemName: widget.itemName,
              itemType: widget.itemType,
              amount: widget.amount,
              paymentId: paymentId,
            ),
          ),
        );
      }
    } catch (e) {
      print('❌ Booking update error: $e');
      // Still show success since payment was successful
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => payment_success(
              bookingId: _createdBookingId ?? widget.bookingId ?? '',
              productId: widget.productId,
              activityId: widget.activityId,
              itemName: widget.itemName,
              itemType: widget.itemType,
              amount: widget.amount,
              paymentId: paymentId,
            ),
          ),
        );
      }
    }
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Payment Error'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _processPayment() async {
    if (_isProcessing) return;

    setState(() {
      _isProcessing = true;
      _errorMessage = null;
    });

    try {
      // 1. First, create a booking (if not exists)
      String? bookingId = widget.bookingId;

      if (bookingId == null || bookingId.isEmpty) {
        print('📝 Creating new booking...');

        final bookingData = {
          'productId': widget.productId,
          'activityId': widget.activityId,
          'totalAmount': widget.amount,
          'guests': 1,
          'paymentStatus': 'pending',
          'status': 'pending',
          'checkIn': DateTime.now().toIso8601String(),
          'checkOut': DateTime.now()
              .add(const Duration(days: 3))
              .toIso8601String(),
        };

        final bookingResponse = await ApiService.postWithToken(
          ApiConstants.createBooking,
          bookingData,
        );

        print('📥 Booking Response: $bookingResponse');

        if (bookingResponse['success'] == true) {
          // Extract booking ID from response
          if (bookingResponse['booking'] != null) {
            bookingId =
                bookingResponse['booking']['_id'] ??
                bookingResponse['booking']['id'];
          } else if (bookingResponse['data'] != null) {
            bookingId =
                bookingResponse['data']['_id'] ?? bookingResponse['data']['id'];
          } else if (bookingResponse['_id'] != null) {
            bookingId = bookingResponse['_id'];
          } else {
            throw Exception('Could not extract booking ID from response');
          }

          setState(() {
            _createdBookingId = bookingId;
          });
          print('✅ Booking created: $bookingId');
        } else {
          throw Exception(
            bookingResponse['message'] ?? 'Booking creation failed',
          );
        }
      }

      if (bookingId == null || bookingId.isEmpty) {
        throw Exception('Booking ID is null or empty');
      }

      // 2. Build a safe receipt string — Razorpay max is 40 chars
      final rawReceipt = 'BK_${bookingId}';
      final receipt = rawReceipt.length > 40
          ? rawReceipt.substring(0, 40)
          : rawReceipt;

      // 3. Create Razorpay order
      final orderResponse = await RazorpayService.createOrder(
        amount: widget.amount,
        receipt: receipt,
        notes: {
          'booking_id': bookingId,
          'product_id': widget.productId ?? '',
          'activity_id': widget.activityId ?? '',
          'item_name': widget.itemName,
          'item_type': widget.itemType,
        },
      );

      _razorpayOrderId = orderResponse['id'];
      print('✅ Razorpay order created: $_razorpayOrderId');

      // 4. Get user details
      final user = await AuthService.getCurrentUser();

      // 5. Get Razorpay key
      final keyId = await RazorpayService.getRazorpayKey();
      print('✅ Razorpay key obtained');

      // 6. Open Razorpay checkout — pass bookingId so callback can use it
      await RazorpayService.openCheckout(
        keyId: keyId,
        orderId: _razorpayOrderId!,
        amount: widget.amount,
        receipt: receipt,
        itemName: widget.itemName,
        customerName: user?['fullName'] ?? user?['name'] ?? 'Customer',
        customerEmail: user?['email'] ?? 'customer@example.com',
        customerContact: user?['phone'] ?? '9999999999',
        bookingId: bookingId,
      );

      // Success/Error handled in callbacks above
    } catch (e) {
      print('❌ Payment processing error: $e');
      setState(() {
        _isProcessing = false;
        _errorMessage = e.toString();
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Payment Failed: ${e.toString()}'),
          backgroundColor: Colors.red,
          duration: const Duration(seconds: 4),
        ),
      );
    }
  }

  @override
  void dispose() {
    RazorpayService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: sandWhite,
      appBar: AppBar(
        backgroundColor: Colors.white.withOpacity(0.9),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: deepNavy),
          onPressed: () {
            if (!_isProcessing) {
              Navigator.maybePop(context);
            }
          },
        ),
        title: const Text(
          'Secure Payment',
          style: TextStyle(
            color: deepNavy,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: const Color(0xFFE0E8FF).withOpacity(0.4),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.verified_user,
                      color: Color(0xFF006B5C),
                      size: 14,
                    ),
                    SizedBox(width: 4),
                    Text(
                      'SSL SECURED',
                      style: TextStyle(
                        color: Color(0xFF006B5C),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildBookingSummaryCard(),
            const SizedBox(height: 16),
            _buildTrustBadgeMetrics(),
            const SizedBox(height: 24),
            _buildPayButton(),
            if (_errorMessage != null) ...[
              const SizedBox(height: 12),
              _buildErrorMessage(),
            ],
            const SizedBox(height: 24),
            _buildContextualHelpCard(),
          ],
        ),
      ),
    );
  }

  Widget _buildBookingSummaryCard() {
    final String imageUrl = widget.itemImage.isNotEmpty
        ? widget.itemImage
        : (widget.itemType == 'product'
              ? 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600'
              : 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600');

    final String displayBookingId =
        _createdBookingId ?? widget.bookingId ?? 'New Booking';
    final String shortBookingId = displayBookingId.length > 12
        ? '${displayBookingId.substring(0, 12)}...'
        : displayBookingId;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.3)),
        boxShadow: [
          BoxShadow(
            color: deepNavy.withOpacity(0.04),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.receipt_long_outlined, color: outline, size: 20),
              SizedBox(width: 8),
              Text(
                'Booking Summary',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: deepNavy,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  image: DecorationImage(
                    image: NetworkImage(imageUrl),
                    fit: BoxFit.cover,
                    onError: (_, __) => const Icon(Icons.image, size: 40),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.itemName,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: deepNavy,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      widget.itemType == 'product' ? 'Package' : 'Activity',
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 13,
                        color: outline,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: oceanBlue.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        '⭐ ${widget.itemType == 'product' ? 'Package' : 'Activity'}',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: oceanBlue,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 16.0),
            child: Divider(color: Color(0xFFF1F3FF), thickness: 1),
          ),
          _buildSummaryItemRow('Item', widget.itemName),
          const SizedBox(height: 12),
          _buildSummaryItemRow(
            'Type',
            widget.itemType == 'product' ? 'Package' : 'Activity',
          ),
          const SizedBox(height: 12),
          _buildSummaryItemRow('Booking ID', shortBookingId),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 16.0),
            child: Divider(color: Color(0xFFE8EDFF), thickness: 1.5, height: 1),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'TOTAL AMOUNT',
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: outline.withOpacity(0.8),
                      letterSpacing: 0.5,
                    ),
                  ),
                  Text(
                    '₹${widget.amount.toStringAsFixed(0)}',
                    style: const TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: deepNavy,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: const Color(0xFF006B5C).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text(
                  'Secure',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF006B5C),
                    fontFamily: 'Inter',
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryItemRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontFamily: 'Inter',
            fontSize: 14,
            color: outline,
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            fontFamily: 'Inter',
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: deepNavy,
          ),
        ),
      ],
    );
  }

  Widget _buildTrustBadgeMetrics() {
    return Row(
      children: [
        _buildSingleBadge(Icons.verified_outlined, 'PCI-DSS Compliant'),
        const SizedBox(width: 12),
        _buildSingleBadge(
          Icons.enhanced_encryption_outlined,
          '256-bit AES Protection',
        ),
        const SizedBox(width: 12),
        _buildSingleBadge(Icons.security_outlined, 'Secure Payment'),
      ],
    );
  }

  Widget _buildSingleBadge(IconData icon, String message) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 4),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.7),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white.withOpacity(0.4)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: oceanBlue, size: 18),
            const SizedBox(height: 4),
            Flexible(
              child: Text(
                message,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.w600,
                  color: deepNavy,
                  fontFamily: 'Inter',
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorMessage() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.red.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.red.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline, color: Colors.red, size: 20),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              _errorMessage ?? 'Payment failed',
              style: const TextStyle(color: Colors.red, fontSize: 14),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPayButton() {
    return SizedBox(
      width: double.infinity,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: _isSuccess
              ? null
              : const LinearGradient(colors: [oceanBlue, turquoiseLagoon]),
          color: _isSuccess ? const Color(0xFF006B5C) : null,
          boxShadow: [
            BoxShadow(
              color: (_isSuccess ? const Color(0xFF006B5C) : oceanBlue)
                  .withOpacity(0.25),
              blurRadius: 20,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: ElevatedButton(
          onPressed: (_isProcessing || _isSuccess) ? null : _processPayment,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.transparent,
            shadowColor: Colors.transparent,
            padding: const EdgeInsets.symmetric(vertical: 18),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
          ),
          child: _isProcessing
              ? Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2.5,
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Text(
                      'Processing...',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                )
              : _isSuccess
              ? Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.check_circle,
                      color: Colors.white,
                      size: 22,
                    ),
                    const SizedBox(width: 10),
                    const Text(
                      'Payment Successful!',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                )
              : Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.lock, color: Colors.white, size: 20),
                    const SizedBox(width: 10),
                    Text(
                      'Pay ₹${widget.amount.toStringAsFixed(0)}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }

  Widget _buildContextualHelpCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: const Border(left: BorderSide(color: sunsetOrange, width: 4)),
        boxShadow: [
          BoxShadow(
            color: deepNavy.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: sunsetOrange.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.headphones_outlined,
              color: sunsetOrange,
              size: 20,
            ),
          ),
          const SizedBox(width: 16),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Need help?',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: deepNavy,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  'Our support team is available 24/7.',
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 12,
                    color: outline,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
