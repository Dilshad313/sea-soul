import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:seasoul/payment.dart';
import 'package:seasoul/services/activity_service.dart';
import 'package:seasoul/services/wishlist_service.dart';
import 'package:seasoul/services/review_service.dart';
import 'package:seasoul/services/location_service.dart';
import 'package:seasoul/models/review_model.dart';
import 'package:seasoul/widgets/review_card.dart';
import 'package:seasoul/widgets/star_rating.dart';
import 'package:share_plus/share_plus.dart';

class ActivityDetailsPage extends StatefulWidget {
  final String activityId;

  const ActivityDetailsPage({
    super.key,
    required this.activityId,
  });

  @override
  State<ActivityDetailsPage> createState() => _ActivityDetailsPageState();
}

class _ActivityDetailsPageState extends State<ActivityDetailsPage> {
  bool _isBookmarked = false;
  bool _isLoading = true;
  bool _isSaving = false;
  Map<String, dynamic>? _activity;

  // ✅ Distance related variables
  double _distanceInKm = 0.0;
  String _distanceText = 'Loading...';
  String _fromLocation = 'Your Location';
  bool _isDistanceLoading = true;

  // ✅ Review related variables
  double _averageRating = 0.0;
  int _totalReviews = 0;
  bool _isLoadingReviews = true;

  static const Color deepNavy = Color(0xFF1A2B49);
  static const Color oceanBlue = Color(0xFF0099CC);
  static const Color sunsetOrange = Color(0xFFFFB84D);
  static const Color turquoiseLagoon = Color(0xFF00C2A8);
  static const Color outline = Color(0xFF6E7880);
  static const Color sandWhite = Color(0xFFF8FBFF);

  // ✅ Island coordinates for Lakshadweep
  final Map<String, Map<String, double>> islandCoordinates = {
    'Agatti': {'lat': 10.8327, 'lng': 72.2067},
    'Kavaratti': {'lat': 10.5667, 'lng': 72.6333},
    'Minicoy': {'lat': 8.2856, 'lng': 73.0459},
    'Kalpeni': {'lat': 10.0692, 'lng': 73.6400},
    'Androth': {'lat': 10.8150, 'lng': 73.6800},
    'Bangaram': {'lat': 10.9100, 'lng': 72.2900},
    'Kadmat': {'lat': 11.2200, 'lng': 72.7800},
    'Kiltan': {'lat': 11.4800, 'lng': 72.9600},
    'Chetlat': {'lat': 11.7000, 'lng': 72.7000},
    'Bitra': {'lat': 11.5500, 'lng': 72.1500},
    'Amini': {'lat': 11.1300, 'lng': 72.7200},
  };

  @override
  void initState() {
    super.initState();
    _loadActivity();
    _checkWishlistStatus();
    _loadReviews(); // ✅ Load reviews
  }

  Future<void> _checkWishlistStatus() async {
    final inWishlist = await WishlistService.isInWishlist(widget.activityId);
    if (mounted) {
      setState(() {
        _isBookmarked = inWishlist;
      });
    }
  }

  Future<void> _loadActivity() async {
    setState(() => _isLoading = true);
    try {
      final response = await ActivityService.getActivityById(widget.activityId);
      if (response['success'] == true) {
        if (mounted) {
          setState(() {
            _activity = response['activity'];
            _isLoading = false;
          });
          _calculateDistance();
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
      print('❌ Error loading activity: $e');
    }
  }

  // ✅ Load reviews and update rating
  Future<void> _loadReviews() async {
    setState(() => _isLoadingReviews = true);
    try {
      final response = await ReviewService.getItemReviews(
        itemId: widget.activityId,
        itemType: 'activity',
        limit: 10,
      );
      
      if (response['success'] == true) {
        setState(() {
          _averageRating = (response['averageRating'] ?? 0).toDouble();
          _totalReviews = response['totalReviews'] ?? 0;
          _isLoadingReviews = false;
        });
        print('✅ Loaded reviews: $_averageRating stars, $_totalReviews reviews');
      } else {
        setState(() {
          _averageRating = 0.0;
          _totalReviews = 0;
          _isLoadingReviews = false;
        });
      }
    } catch (e) {
      setState(() {
        _averageRating = 0.0;
        _totalReviews = 0;
        _isLoadingReviews = false;
      });
      print('❌ Error loading reviews: $e');
    }
  }

  Future<void> _calculateDistance() async {
    if (_activity == null) return;
    
    final Map<String, dynamic> activity = _activity!;
    String location = activity['location'] ?? '';
    String islandKey = '';
    
    for (var key in islandCoordinates.keys) {
      if (location.toLowerCase().contains(key.toLowerCase())) {
        islandKey = key;
        break;
      }
    }

    if (islandKey.isEmpty) {
      islandKey = 'Agatti';
    }

    final destLat = islandCoordinates[islandKey]!['lat']!;
    final destLon = islandCoordinates[islandKey]!['lng']!;

    setState(() => _isDistanceLoading = true);

    try {
      final result = await LocationService.getDistanceToDestination(
        destLat: destLat,
        destLon: destLon,
        destName: islandKey,
      );

      setState(() {
        if (result['success'] == true) {
          _distanceInKm = result['distance'] ?? 0;
          _distanceText = result['formattedDistance'] ?? '--';
          _fromLocation = result['fromLocation'] ?? 'Your Location';
        } else {
          _distanceText = '--';
        }
        _isDistanceLoading = false;
      });
    } catch (e) {
      setState(() {
        _distanceText = '--';
        _isDistanceLoading = false;
      });
      print('❌ Error calculating distance: $e');
    }
  }

  Future<void> _saveToWishlist() async {
    setState(() => _isSaving = true);
    
    try {
      if (_isBookmarked) {
        await WishlistService.removeFromWishlist(widget.activityId);
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
        final activity = _activity!;
        await WishlistService.addToWishlist({
          'id': activity['_id'],
          'name': activity['name'],
          'location': activity['location'],
          'price': activity['price'],
          'images': activity['images'],
          'type': 'activity',
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

  Future<void> _shareActivity() async {
    final activity = _activity!;
    final String shareText = '''
🌊 SeaSoul - ${activity['name'] ?? 'Amazing Activity'}

📍 Location: ${activity['location'] ?? 'Lakshadweep'}
📏 Distance: $_distanceText from $_fromLocation
⭐ Rating: ${_averageRating > 0 ? _averageRating.toStringAsFixed(1) : '0.0'} ★ (${_totalReviews} reviews)
💰 Price: ₹${activity['price'] ?? 0} / person
⏰ Duration: ${activity['duration'] ?? '2 hours'}

${activity['description'] ?? ''}

✨ Book now and experience the adventure!
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

    if (_activity == null) {
      return Scaffold(
        backgroundColor: sandWhite,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: outline),
              const SizedBox(height: 16),
              const Text(
                'Activity not found',
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

    final activity = _activity!;
    final images = activity['images'] ?? [];
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
                _buildHeroSection(context, mainImage, activity),
                _buildStatsMetricsSection(activity),
                _buildDescriptionSection(activity),
                _buildGallerySection(images),
                _buildReviewsSection(),
                _buildIncludesSection(activity),
                _buildRequirementsSection(activity),
                const SizedBox(height: 140),
              ],
            ),
          ),
          _buildScreenHeaderOverlay(context),
          _buildStickyBookingFooter(activity),
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
                      onTap: _shareActivity,
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

  Widget _buildHeroSection(BuildContext context, String imageUrl, Map<String, dynamic> activity) {
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
                  color: activity['category'] == 'Water Sports' 
                      ? oceanBlue 
                      : activity['category'] == 'Adventure'
                          ? const Color(0xFFFF6B35)
                          : turquoiseLagoon,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  activity['category'] ?? 'Activity',
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
                activity['name'] ?? 'Activity',
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
                activity['location'] ?? 'Location',
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

  // ✅ Updated: _buildStatsMetricsSection with real distance and star rating
  Widget _buildStatsMetricsSection(Map<String, dynamic> activity) {
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
            // ✅ STAR RATING SECTION
            Expanded(
              child: Column(
                children: [
                  if (_isLoadingReviews)
                    const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: oceanBlue,
                      ),
                    )
                  else
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // ✅ Show stars based on average rating
                        StarRating(
                          rating: _averageRating,
                          size: 18,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          _averageRating > 0 
                              ? _averageRating.toStringAsFixed(1)
                              : '0.0',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: deepNavy,
                          ),
                        ),
                      ],
                    ),
                  const SizedBox(height: 2),
                  Text(
                    _totalReviews > 0 
                        ? '$_totalReviews REVIEWS'
                        : 'NO REVIEWS YET',
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
            // ✅ DISTANCE SECTION
            Expanded(
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.location_on_outlined, color: oceanBlue, size: 18),
                      const SizedBox(width: 4),
                      if (_isDistanceLoading)
                        const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: oceanBlue,
                          ),
                        )
                      else
                        Text(
                          _distanceText,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: deepNavy,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'FROM ${_fromLocation.toUpperCase()}',
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

  Widget _buildDescriptionSection(Map<String, dynamic> activity) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 32, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'About This Activity',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: deepNavy,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            activity['description'] ?? 'No description available',
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
                const Icon(Icons.location_on_outlined, color: oceanBlue),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'LOCATION',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: outline,
                          letterSpacing: 0.5,
                        ),
                      ),
                      Text(
                        activity['location'] ?? 'Location',
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
                        '₹${activity['price'] ?? 0} / person',
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
    if (images.isEmpty || images.length <= 1) return const SizedBox.shrink();

    final displayImages = images.length > 1 ? images.sublist(1) : [];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 36, 20, 12),
          child: const Text(
            'Gallery',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: deepNavy,
            ),
          ),
        ),
        SizedBox(
          height: 150,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 20),
            itemCount: displayImages.length,
            itemBuilder: (context, index) {
              return Container(
                width: 220,
                margin: const EdgeInsets.only(right: 14),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  image: DecorationImage(
                    image: NetworkImage(displayImages[index]),
                    fit: BoxFit.cover,
                    onError: (exception, stackTrace) {
                      // Handle image load error silently
                    },
                  ),
                ),
                child: displayImages[index].isEmpty
                    ? const Icon(Icons.broken_image, color: Colors.grey)
                    : null,
              );
            },
          ),
        ),
      ],
    );
  }

  // ==================== REVIEWS SECTION ====================
  Widget _buildReviewsSection() {
    return FutureBuilder<Map<String, dynamic>>(
      future: ReviewService.getItemReviews(
        itemId: widget.activityId,
        itemType: 'activity',
        limit: 5,
      ),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Padding(
            padding: EdgeInsets.all(20),
            child: Center(child: CircularProgressIndicator()),
          );
        }

        if (snapshot.hasError) {
          return Padding(
            padding: const EdgeInsets.all(20),
            child: Center(
              child: Text(
                'Error loading reviews: ${snapshot.error}',
                style: const TextStyle(color: Colors.red),
              ),
            ),
          );
        }

        final data = snapshot.data;
        if (data == null || data['success'] != true) {
          return const SizedBox.shrink();
        }

        final reviews = (data['reviews'] as List)
            .map((r) => ReviewModel.fromJson(r))
            .toList();

        // ✅ Update average rating and total reviews from API
        final averageRating = data['averageRating'] ?? 0;
        final totalReviews = data['totalReviews'] ?? 0;

        // ✅ Update state variables
        if (_averageRating != averageRating || _totalReviews != totalReviews) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            setState(() {
              _averageRating = averageRating.toDouble();
              _totalReviews = totalReviews;
            });
          });
        }

        if (reviews.isEmpty) {
          return Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                const Icon(Icons.rate_review, size: 48, color: Colors.grey),
                const SizedBox(height: 8),
                const Text(
                  'No reviews yet',
                  style: TextStyle(fontSize: 16, color: Colors.grey),
                ),
                const SizedBox(height: 4),
                Text(
                  'Be the first to review this activity!',
                  style: TextStyle(fontSize: 14, color: Colors.grey[400]),
                ),
              ],
            ),
          );
        }

        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Rating summary
              Row(
                children: [
                  const Text(
                    'Reviews',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1A2B49),
                    ),
                  ),
                  const Spacer(),
                  StarRating(
                    rating: averageRating,
                    size: 18,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '($totalReviews)',
                    style: const TextStyle(
                      fontSize: 14,
                      color: Color(0xFF6E7880),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              // Reviews list
              ...reviews.map((review) => ReviewCard(
                review: review,
                onHelpfulTap: () async {
                  try {
                    await ReviewService.toggleHelpful(review.id);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('✅ Marked as helpful'),
                        backgroundColor: Colors.green,
                        duration: Duration(seconds: 2),
                      ),
                    );
                    // ✅ Refresh reviews after helpful toggle
                    _loadReviews();
                  } catch (e) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Error: ${e.toString()}'),
                        backgroundColor: Colors.red,
                      ),
                    );
                  }
                },
              )),
            ],
          ),
        );
      },
    );
  }

  Widget _buildIncludesSection(Map<String, dynamic> activity) {
    final includes = activity['includes'] ?? [];
    if (includes.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "What's Included",
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: deepNavy,
            ),
          ),
          const SizedBox(height: 12),
          ...includes.map((item) => Padding(
            padding: const EdgeInsets.only(bottom: 8.0),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: turquoiseLagoon.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.check,
                    color: turquoiseLagoon,
                    size: 16,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    item,
                    style: const TextStyle(
                      fontSize: 15,
                      color: deepNavy,
                    ),
                  ),
                ),
              ],
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildRequirementsSection(Map<String, dynamic> activity) {
    final requirements = activity['requirements'] ?? [];
    if (requirements.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Requirements',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: deepNavy,
            ),
          ),
          const SizedBox(height: 12),
          ...requirements.map((item) => Padding(
            padding: const EdgeInsets.only(bottom: 8.0),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: sunsetOrange.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.info_outline,
                    color: sunsetOrange,
                    size: 16,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    item,
                    style: const TextStyle(
                      fontSize: 15,
                      color: deepNavy,
                    ),
                  ),
                ),
              ],
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildStickyBookingFooter(Map<String, dynamic> activity) {
    final price = activity['price'] ?? 0;
    final images = activity['images'] ?? [];
    final imageUrl = images.isNotEmpty ? images[0] : '';
    final name = activity['name'] ?? 'Activity';

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
                      'PRICE',
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
                        text: '₹$price',
                        style: const TextStyle(
                          fontSize: 26,
                          fontWeight: FontWeight.bold,
                          color: deepNavy,
                        ),
                        children: const [
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
                      MaterialPageRoute(
                        builder: (context) => payment(
                          activityId: activity['_id'],
                          itemName: name,
                          itemType: 'activity',
                          amount: price.toDouble(),
                          itemImage: imageUrl,
                        ),
                      ),
                    ).then((_) {
                      // ✅ Refresh reviews when coming back from payment
                      _loadReviews();
                    });
                  },
                  icon: const Icon(Icons.bolt, color: Colors.white, size: 18),
                  label: const Text(
                    'Book Now',
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