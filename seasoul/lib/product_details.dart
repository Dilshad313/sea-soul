import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:seasoul/payment.dart';
import 'package:seasoul/activity_details.dart'; // ✅ Added import
import 'package:seasoul/services/product_service.dart';
import 'package:seasoul/services/activity_service.dart';
import 'package:seasoul/services/wishlist_service.dart';
import 'package:share_plus/share_plus.dart';

class ProductDetailsPage extends StatefulWidget {
  final String productId;

  const ProductDetailsPage({
    super.key,
    required this.productId,
  });

  @override
  State<ProductDetailsPage> createState() => _ProductDetailsPageState();
}

class _ProductDetailsPageState extends State<ProductDetailsPage> {
  bool _isBookmarked = false;
  bool _isLoading = true;
  bool _isSaving = false;
  Map<String, dynamic>? _product;
  List<dynamic> _activities = [];

  static const Color deepNavy = Color(0xFF1A2B49);
  static const Color oceanBlue = Color(0xFF0099CC);
  static const Color sunsetOrange = Color(0xFFFFB84D);
  static const Color outline = Color(0xFF6E7880);
  static const Color sandWhite = Color(0xFFF8FBFF);

  @override
  void initState() {
    super.initState();
    _loadProduct();
    _loadActivities();
    _checkWishlistStatus();
  }

  Future<void> _checkWishlistStatus() async {
    final inWishlist = await WishlistService.isInWishlist(widget.productId);
    if (mounted) {
      setState(() {
        _isBookmarked = inWishlist;
      });
    }
  }

  Future<void> _loadProduct() async {
    setState(() => _isLoading = true);
    try {
      final response = await ProductService.getProductById(widget.productId);
      if (response['success'] == true) {
        if (mounted) {
          setState(() {
            _product = response['product'];
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
      print('❌ Error loading product: $e');
    }
  }

  Future<void> _loadActivities() async {
    try {
      final response = await ActivityService.getActivities(limit: 3);
      if (response['success'] == true) {
        if (mounted) {
          setState(() {
            _activities = response['activities'] ?? [];
          });
        }
      }
    } catch (e) {
      print('❌ Error loading activities: $e');
    }
  }

  Future<void> _saveToWishlist() async {
    setState(() => _isSaving = true);
    
    try {
      if (_isBookmarked) {
        await WishlistService.removeFromWishlist(widget.productId);
        if (mounted) {
          setState(() {
            _isBookmarked = false;
            _isSaving = false;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('❌ Removed from wishlist'),
              backgroundColor: Colors.red,
              duration: Duration(seconds: 2),
            ),
          );
        }
      } else {
        final product = _product!;
        await WishlistService.addToWishlist({
          'id': product['_id'],
          'name': product['name'],
          'location': product['location'],
          'price': product['price'],
          'images': product['images'],
          'type': 'product',
        });
        if (mounted) {
          setState(() {
            _isBookmarked = true;
            _isSaving = false;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('✅ Added to wishlist!'),
              backgroundColor: Colors.green,
              duration: Duration(seconds: 2),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSaving = false);
      }
      print('❌ Error saving to wishlist: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _shareProduct() async {
    final product = _product!;
    final String shareText = '''
🌊 SeaSoul - ${product['name'] ?? 'Amazing Package'}

📍 Location: ${product['location'] ?? 'Lakshadweep'}
💰 Price: ₹${product['price'] ?? 0} / person
⭐ Rating: ${product['rating'] ?? 4.5} ★

${product['description'] ?? ''}

✨ Book now and experience the beauty of Lakshadweep!
📱 Download SeaSoul App: https://seasoul.com/download
  ''';
  
  try {
    await Share.share(shareText);
  } catch (e) {
    print('❌ Error sharing: $e');
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error sharing: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        backgroundColor: sandWhite,
        body: const Center(
          child: CircularProgressIndicator(
            color: oceanBlue,
          ),
        ),
      );
    }

    if (_product == null) {
      return Scaffold(
        backgroundColor: sandWhite,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: outline),
              const SizedBox(height: 16),
              const Text(
                'Product not found',
                style: TextStyle(fontSize: 18, color: deepNavy),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: oceanBlue,
                ),
                child: const Text('Go Back'),
              ),
            ],
          ),
        ),
      );
    }

    final product = _product!;
    final images = product['images'] ?? [];
    final mainImage = images.isNotEmpty ? images[0] : 
        'https://via.placeholder.com/400x300';

    return Scaffold(
      backgroundColor: sandWhite,
      body: Stack(
        children: [
          SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeroSection(context, mainImage, product),
                _buildStatsMetricsSection(product),
                _buildDescriptionSection(product),
                _buildGallerySection(images),
                _buildActivitiesSection(),
                const SizedBox(height: 140),
              ],
            ),
          ),
          _buildScreenHeaderOverlay(context),
          _buildStickyBookingFooter(product),
        ],
      ),
    );
  }

  Widget _buildScreenHeaderOverlay(BuildContext context) {
    return Positioned(
      top: 0,
      left: 0,
      right: 0,
      child: ClipRRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            color: Colors.white.withOpacity(0.1),
            padding: EdgeInsets.only(
              top: MediaQuery.of(context).padding.top + 8,
              left: 20,
              right: 20,
              bottom: 12,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildGlassButton(
                  icon: Icons.arrow_back,
                  onTap: () => Navigator.maybePop(context),
                ),
                Row(
                  children: [
                    _buildGlassButton(
                      icon: _isBookmarked ? Icons.bookmark : Icons.bookmark_border,
                      iconColor: _isBookmarked ? sunsetOrange : deepNavy,
                      onTap: _saveToWishlist,
                      isLoading: _isSaving,
                    ),
                    const SizedBox(width: 8),
                    _buildGlassButton(
                      icon: Icons.share_outlined,
                      onTap: _shareProduct,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildGlassButton({
    required IconData icon,
    required VoidCallback onTap,
    Color iconColor = deepNavy,
    bool isLoading = false,
  }) {
    return GestureDetector(
      onTap: isLoading ? null : onTap,
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.7),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.white.withOpacity(0.4)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: isLoading
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: oceanBlue,
                ),
              )
            : Icon(icon, color: iconColor, size: 22),
      ),
    );
  }

  Widget _buildHeroSection(BuildContext context, String imageUrl, Map<String, dynamic> product) {
    return Stack(
      children: [
        SizedBox(
          height: MediaQuery.of(context).size.height * 0.58,
          width: double.infinity,
          child: Image.network(
            imageUrl,
            fit: BoxFit.cover,
            errorBuilder: (BuildContext context, Object error, StackTrace? stackTrace) {
              return Container(
                color: Colors.grey[200],
                child: const Icon(Icons.broken_image, size: 50, color: Colors.grey),
              );
            },
          ),
        ),
        Positioned.fill(
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.black.withOpacity(0.2),
                  Colors.transparent,
                  Colors.transparent,
                  sandWhite,
                ],
                stops: const [0.0, 0.2, 0.8, 1.0],
              ),
            ),
          ),
        ),
        Positioned(
          left: 20,
          right: 20,
          bottom: 24,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: product['isFeatured'] == true ? sunsetOrange : oceanBlue,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  product['isFeatured'] == true ? 'FEATURED' : 'TRENDING DESTINATION',
                  style: const TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    letterSpacing: 0.8,
                  ),
                ),
              ),
              const SizedBox(height: 10),
              Text(
                product['name'] ?? 'Product',
                style: const TextStyle(
                  fontSize: 34,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  shadows: [
                    Shadow(
                      color: Colors.black26,
                      blurRadius: 8,
                      offset: Offset(0, 2),
                    ),
                  ],
                ),
              ),
              Text(
                product['location'] ?? 'Location',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w500,
                  color: Colors.white70,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStatsMetricsSection(Map<String, dynamic> product) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.8),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withOpacity(0.5)),
          boxShadow: [
            BoxShadow(
              color: deepNavy.withOpacity(0.05),
              blurRadius: 20,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                children: [
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.star, color: sunsetOrange, size: 18),
                      SizedBox(width: 4),
                      Text(
                        '4.9',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: deepNavy,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${product['reviews'] ?? 0} REVIEWS',
                    style: TextStyle(
                      fontSize: 10,
                      color: outline.withOpacity(0.8),
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.8,
                    ),
                  ),
                ],
              ),
            ),
            Container(height: 30, width: 1, color: outline.withOpacity(0.2)),
            Expanded(
              child: Column(
                children: [
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.location_on_outlined, color: oceanBlue, size: 18),
                      SizedBox(width: 4),
                      Text(
                        '459 km',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: deepNavy,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'FROM ${product['location']?.toUpperCase() ?? 'KOCHI'}',
                    style: TextStyle(
                      fontSize: 10,
                      color: outline.withOpacity(0.8),
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.8,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDescriptionSection(Map<String, dynamic> product) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 32, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            product['name'] ?? 'Experience Serenity',
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: deepNavy,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            product['description'] ?? 'No description available',
            style: const TextStyle(
              fontFamily: 'Inter',
              fontSize: 15,
              color: outline,
              height: 1.6,
            ),
          ),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: oceanBlue.withOpacity(0.05),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: oceanBlue.withOpacity(0.1)),
            ),
            child: Row(
              children: [
                const Icon(Icons.calendar_today_outlined, color: oceanBlue),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'DURATION',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: outline,
                          letterSpacing: 0.5,
                        ),
                      ),
                      Text(
                        product['duration'] ?? '3 Nights / 4 Days',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: deepNavy,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: sunsetOrange.withOpacity(0.05),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: sunsetOrange.withOpacity(0.1)),
            ),
            child: Row(
              children: [
                const Icon(Icons.currency_rupee, color: sunsetOrange),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'PRICE',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: outline,
                          letterSpacing: 0.5,
                        ),
                      ),
                      Text(
                        '₹${product['price'] ?? 0} / person',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: deepNavy,
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

  Widget _buildGallerySection(List<dynamic> images) {
    if (images.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 36, 20, 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Gallery',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: deepNavy,
                ),
              ),
              TextButton(
                onPressed: () {
                  _showGalleryDialog(images);
                },
                child: const Text(
                  'View All',
                  style: TextStyle(
                    color: oceanBlue,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
        SizedBox(
          height: 150,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 20),
            itemCount: images.length > 4 ? 4 : images.length,
            itemBuilder: (context, index) {
              return GestureDetector(
                onTap: () => _showGalleryDialog(images, initialIndex: index),
                child: Container(
                  width: 220,
                  margin: const EdgeInsets.only(right: 14),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    image: DecorationImage(
                      image: NetworkImage(images[index]),
                      fit: BoxFit.cover,
                      onError: (exception, stackTrace) {
                        // Handle image load error silently
                      },
                    ),
                  ),
                  child: images[index].isEmpty
                      ? const Icon(Icons.broken_image, color: Colors.grey)
                      : null,
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  void _showGalleryDialog(List<dynamic> images, {int initialIndex = 0}) {
    final PageController pageController = PageController(initialPage: initialIndex);

    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        child: Container(
          height: MediaQuery.of(context).size.height * 0.8,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Gallery',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: deepNavy,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: deepNavy),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: PageView.builder(
                  controller: pageController,
                  itemCount: images.length,
                  itemBuilder: (context, index) {
                    return Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.network(
                          images[index],
                          fit: BoxFit.contain,
                          width: double.infinity,
                          errorBuilder: (BuildContext context, Object error, StackTrace? stackTrace) {
                            return Container(
                              color: Colors.grey[200],
                              child: const Icon(
                                Icons.broken_image,
                                size: 50,
                                color: Colors.grey,
                              ),
                            );
                          },
                        ),
                      ),
                    );
                  },
                ),
              ),
              if (images.length > 1)
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(
                      images.length,
                      (index) => Container(
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: index == 0 ? oceanBlue : Colors.grey[300],
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  // ============================================================================
  // ✅ FIXED: Things to Do Section with Navigation
  // ============================================================================

  Widget _buildActivitiesSection() {
    if (_activities.isEmpty) {
      return const SizedBox.shrink();
    }

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 36, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Things to Do',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: deepNavy,
            ),
          ),
          const SizedBox(height: 16),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _activities.length > 3 ? 3 : _activities.length,
            itemBuilder: (context, index) {
              final activity = _activities[index];
              final images = activity['images'] ?? [];
              final imageUrl = images.isNotEmpty ? images[0] : 
                  'https://via.placeholder.com/300x200';
              
              return GestureDetector(
                onTap: () {
                  // ✅ Navigate to Activity Details Page
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => ActivityDetailsPage(
                        activityId: activity['_id'],
                      ),
                    ),
                  );
                },
                child: Container(
                  margin: const EdgeInsets.only(bottom: 14),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: Colors.white.withOpacity(0.6)),
                    boxShadow: [
                      BoxShadow(
                        color: deepNavy.withOpacity(0.03),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 72,
                        height: 72,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(12),
                          image: DecorationImage(
                            image: NetworkImage(imageUrl),
                            fit: BoxFit.cover,
                            onError: (exception, stackTrace) {
                              // Handle image load error silently
                            },
                          ),
                        ),
                        child: imageUrl.isEmpty
                            ? const Icon(Icons.broken_image, color: Colors.grey)
                            : null,
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              activity['name'] ?? 'Activity',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: deepNavy,
                              ),
                            ),
                            Text(
                              activity['description'] ?? '',
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontFamily: 'Inter',
                                fontSize: 12,
                                color: outline,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                const Icon(
                                  Icons.access_time,
                                  size: 12,
                                  color: outline,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  activity['duration'] ?? '2 hours',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: outline,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                const Icon(
                                  Icons.currency_rupee,
                                  size: 12,
                                  color: outline,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  '${activity['price'] ?? 0}',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: oceanBlue,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const Icon(Icons.chevron_right, color: outline, size: 20),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildStickyBookingFooter(Map<String, dynamic> product) {
    final price = product['price'] ?? 0;
    final discountedPrice = product['discountedPrice'] ?? price;
    final displayPrice = discountedPrice < price ? discountedPrice : price;

    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: ClipRRect(
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(24),
          topRight: Radius.circular(24),
        ),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
          child: Container(
            padding: const EdgeInsets.fromLTRB(24, 16, 24, 28),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.85),
              border: Border(
                top: BorderSide(color: Colors.white.withOpacity(0.3)),
              ),
              boxShadow: [
                BoxShadow(
                  color: deepNavy.withOpacity(0.08),
                  blurRadius: 30,
                  offset: const Offset(0, -4),
                ),
              ],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'STARTING FROM',
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: outline.withOpacity(0.8),
                        letterSpacing: 0.5,
                      ),
                    ),
                    RichText(
                      text: TextSpan(
                        text: '₹$displayPrice',
                        style: const TextStyle(
                          fontSize: 26,
                          fontWeight: FontWeight.bold,
                          color: deepNavy,
                        ),
                        children: [
                          TextSpan(
                            text: ' /person',
                            style: TextStyle(
                              fontSize: 13,
                              color: outline,
                              fontWeight: FontWeight.normal,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const payment()),
                    );
                  },
                  icon: const Icon(Icons.bolt, color: Colors.white, size: 18),
                  label: const Text(
                    'Book Experience',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF006386),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 16,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(999),
                    ),
                    elevation: 0,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}