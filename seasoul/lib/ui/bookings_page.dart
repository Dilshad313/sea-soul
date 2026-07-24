// lib/ui/bookings_page.dart
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:seasoul/services/api_service.dart';
import 'package:seasoul/utils/image_utils.dart';

class BookingsPage extends StatefulWidget {
  const BookingsPage({super.key});

  @override
  State<BookingsPage> createState() => _BookingsPageState();
}

class _BookingsPageState extends State<BookingsPage> {
  List<dynamic> _bookings = [];
  bool _isLoading = true;
  String _errorMessage = '';

  static const Color deepNavy = Color(0xFF1A2B49);
  static const Color oceanBlue = Color(0xFF0099CC);
  static const Color turquoiseLagoon = Color(0xFF00C2A8);
  static const Color sunsetOrange = Color(0xFFFFB84D);
  static const Color outline = Color(0xFF6E7880);
  static const Color sandWhite = Color(0xFFF8FBFF);

  @override
  void initState() {
    super.initState();
    _loadBookings();
  }

  Future<void> _loadBookings() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      final response = await ApiService.getUserBookings();
      
      if (response['success'] == true) {
        setState(() {
          _bookings = response['bookings'] ?? [];
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage = response['message'] ?? 'Failed to load bookings';
          _isLoading = false;
        });
      }
    } catch (e) {
      print('❌ Error loading bookings: $e');
      setState(() {
        _errorMessage = 'Error loading bookings: $e';
        _isLoading = false;
      });
    }
  }

  Widget _buildBookingCard(dynamic booking) {
    final String itemName = booking['productId']?['name'] ?? 
                            booking['activityId']?['name'] ?? 
                            'Package';
    final String itemLocation = booking['productId']?['location'] ?? 
                               booking['activityId']?['location'] ?? 
                               '';
    final String itemCategory = booking['productId']?['category'] ?? 
                               booking['activityId']?['category'] ?? 
                               '';
    final List<dynamic>? images = booking['productId']?['images'] ?? 
                                 booking['activityId']?['images'];
    final String? imageUrl = images != null && images.isNotEmpty 
        ? images[0] 
        : null;
    
    final double totalAmount = (booking['totalAmount'] ?? 0).toDouble();
    final String status = booking['status'] ?? 'pending';
    final String paymentStatus = booking['paymentStatus'] ?? 'pending';
    final String bookingRef = booking['bookingReference'] ?? 'N/A';
    final int guests = booking['guests'] ?? 1;
    
    final DateTime createdAt = DateTime.parse(
      booking['createdAt'] ?? DateTime.now().toIso8601String()
    );
    
    Color statusColor = turquoiseLagoon;
    IconData statusIcon = Icons.check_circle;
    
    if (status == 'confirmed') {
      statusColor = turquoiseLagoon;
      statusIcon = Icons.check_circle;
    } else if (status == 'completed') {
      statusColor = oceanBlue;
      statusIcon = Icons.done_all;
    } else if (status == 'cancelled') {
      statusColor = Colors.red;
      statusIcon = Icons.cancel;
    } else {
      statusColor = sunsetOrange;
      statusIcon = Icons.access_time;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.3)),
        boxShadow: [
          BoxShadow(
            color: deepNavy.withOpacity(0.04),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image Section
          if (imageUrl != null)
            ClipRRect(
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(20),
                topRight: Radius.circular(20),
              ),
              child: _buildNetworkImage(
                imageUrl,
                height: 180,
                width: double.infinity,
                fit: BoxFit.cover,
              ),
            ),
          
          // Content Section
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title and Status
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            itemName,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: deepNavy,
                            ),
                          ),
                          if (itemLocation.isNotEmpty)
                            Padding(
                              padding: const EdgeInsets.only(top: 4),
                              child: Row(
                                children: [
                                  Icon(
                                    Icons.location_on_outlined,
                                    size: 14,
                                    color: outline,
                                  ),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      itemLocation,
                                      style: TextStyle(
                                        fontSize: 13,
                                        color: outline,
                                        fontFamily: 'Inter',
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: statusColor.withOpacity(0.3),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            statusIcon,
                            size: 14,
                            color: statusColor,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            status.toUpperCase(),
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: statusColor,
                              fontFamily: 'Inter',
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                
                const SizedBox(height: 12),
                const Divider(thickness: 1, color: Color(0xFFF1F3FF)),
                const SizedBox(height: 12),
                
                // Booking Details
                _buildDetailRow(
                  'Booking Reference',
                  bookingRef,
                  Icons.receipt_long_outlined,
                ),
                const SizedBox(height: 8),
                _buildDetailRow(
                  'Guests',
                  '$guests',
                  Icons.people_outline,
                ),
                const SizedBox(height: 8),
                _buildDetailRow(
                  'Booking Date',
                  '${createdAt.day}/${createdAt.month}/${createdAt.year}',
                  Icons.calendar_today_outlined,
                ),
                
                const SizedBox(height: 12),
                const Divider(thickness: 1, color: Color(0xFFF1F3FF)),
                const SizedBox(height: 12),
                
                // Amount
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Total Amount',
                      style: TextStyle(
                        fontSize: 14,
                        color: outline,
                        fontFamily: 'Inter',
                      ),
                    ),
                    Text(
                      '₹${totalAmount.toStringAsFixed(0)}',
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: deepNavy,
                      ),
                    ),
                  ],
                ),
                
                // Payment Status Badge
                if (paymentStatus == 'paid')
                  Container(
                    margin: const EdgeInsets.only(top: 12),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: turquoiseLagoon.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.check_circle,
                          size: 14,
                          color: turquoiseLagoon,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          'Payment Completed',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: turquoiseLagoon,
                            fontFamily: 'Inter',
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 16, color: outline),
        const SizedBox(width: 8),
        Text(
          '$label: ',
          style: TextStyle(
            fontSize: 13,
            color: outline,
            fontFamily: 'Inter',
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: deepNavy,
              fontFamily: 'Inter',
            ),
            textAlign: TextAlign.right,
          ),
        ),
      ],
    );
  }

  Widget _buildNetworkImage(
    String imageUrl, {
    double? height,
    double? width,
    BoxFit fit = BoxFit.cover,
  }) {
    final cleanUrl = ImageUtils.getCleanImageUrl(imageUrl);

    if (!ImageUtils.isValidImage(cleanUrl)) {
      return Container(
        height: height,
        width: width,
        color: Colors.grey[200],
        child: const Icon(Icons.broken_image, color: Colors.grey, size: 40),
      );
    }

    return Image.network(
      cleanUrl,
      height: height,
      width: width,
      fit: fit,
      loadingBuilder: (context, child, loadingProgress) {
        if (loadingProgress == null) return child;
        return Container(
          height: height,
          width: width,
          color: Colors.grey[200],
          child: Center(
            child: CircularProgressIndicator(
              value: loadingProgress.expectedTotalBytes != null
                  ? loadingProgress.cumulativeBytesLoaded /
                      loadingProgress.expectedTotalBytes!
                  : null,
              color: oceanBlue,
            ),
          ),
        );
      },
      errorBuilder: (context, error, stackTrace) {
        return Container(
          height: height,
          width: width,
          color: Colors.grey[200],
          child: const Icon(Icons.broken_image, color: Colors.grey, size: 40),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: sandWhite,
      appBar: AppBar(
        backgroundColor: Colors.white.withOpacity(0.9),
        elevation: 0,
        automaticallyImplyLeading: false,
        titleSpacing: 20,
        title: const Text(
          'My Bookings',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: deepNavy,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: deepNavy),
            onPressed: _loadBookings,
          ),
        ],
      ),
      body: _isLoading
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const CircularProgressIndicator(color: oceanBlue),
                  const SizedBox(height: 16),
                  Text(
                    'Loading bookings...',
                    style: TextStyle(
                      color: outline,
                      fontSize: 14,
                      fontFamily: 'Inter',
                    ),
                  ),
                ],
              ),
            )
          : _errorMessage.isNotEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.error_outline,
                          size: 64,
                          color: Colors.red.withOpacity(0.5),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Error',
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: deepNavy,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _errorMessage,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: outline,
                            fontSize: 14,
                            fontFamily: 'Inter',
                          ),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: _loadBookings,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: oceanBlue,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 24,
                              vertical: 12,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                )
              : _bookings.isEmpty
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(32.0),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              width: 96,
                              height: 96,
                              decoration: BoxDecoration(
                                color: oceanBlue.withOpacity(0.12),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                Icons.confirmation_number_outlined,
                                color: oceanBlue,
                                size: 44,
                              ),
                            ),
                            const SizedBox(height: 24),
                            const Text(
                              'No Bookings Yet',
                              style: TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                                color: deepNavy,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'Your confirmed bookings will appear here after successful payment.',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 14,
                                color: outline,
                                fontFamily: 'Inter',
                                height: 1.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _loadBookings,
                      color: oceanBlue,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(20),
                        physics: const AlwaysScrollableScrollPhysics(),
                        itemCount: _bookings.length,
                        itemBuilder: (context, index) {
                          return _buildBookingCard(_bookings[index]);
                        },
                      ),
                    ),
    );
  }
}
