import 'dart:ui';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:seasoul/bottomnav.dart';
import 'package:seasoul/explore.dart';
import 'package:seasoul/profile.dart';
import 'package:seasoul/product_details.dart';
import 'package:seasoul/activity_details.dart';
import 'package:seasoul/services/product_service.dart';
import 'package:seasoul/services/activity_service.dart';
import 'package:url_launcher/url_launcher.dart';

class UserHome extends StatefulWidget {
  const UserHome({super.key});

  @override
  State<UserHome> createState() => _UserHomeState();
}

class _UserHomeState extends State<UserHome> {
  int _currentTab = 0;
  String _selectedSort = 'popular';
  String _searchQuery = '';
  List<dynamic> _products = [];
  List<dynamic> _activities = [];
  bool _isLoading = true;
  bool _isLoadingFeatured = true;
  bool _isLoadingTrending = true;
  bool _isLoadingActivities = true;
  List<dynamic> _featuredProducts = [];
  List<dynamic> _trendingProducts = [];
  List<dynamic> _featuredActivities = [];
  List<dynamic> _allProducts = [];

  // Auto-slide controllers
  late PageController _packagePageController;
  late PageController _activityPageController;
  int _currentPackageIndex = 0;
  int _currentActivityIndex = 0;
  Timer? _packageTimer;
  Timer? _activityTimer;

  static const Color deepNavy = Color(0xFF1A2B49);
  static const Color oceanBlue = Color(0xFF0099CC);
  static const Color sunsetOrange = Color(0xFFFFB84D);
  static const Color outline = Color(0xFF6E7880);

  final List<String> _sortOptions = [
    'popular',
    'rating',
    'price-low',
    'price-high',
    'newest',
  ];

  final Map<String, String> _sortLabels = {
    'popular': 'Most Popular',
    'rating': 'Top Rated',
    'price-low': 'Price: Low to High',
    'price-high': 'Price: High to Low',
    'newest': 'Newest First',
  };

  final Map<String, IconData> _sortIcons = {
    'popular': Icons.trending_up,
    'rating': Icons.star,
    'price-low': Icons.arrow_upward,
    'price-high': Icons.arrow_downward,
    'newest': Icons.fiber_new,
  };

  @override
  void initState() {
    super.initState();
    _packagePageController = PageController();
    _activityPageController = PageController();
    _loadAllData();
  }

  @override
  void dispose() {
    _packagePageController.dispose();
    _activityPageController.dispose();
    _packageTimer?.cancel();
    _activityTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadAllData() async {
    await Future.wait([
      _loadProducts(),
      _loadFeaturedProducts(),
      _loadTrendingProducts(),
      _loadActivities(),
      _loadFeaturedActivities(),
    ]);
    
    // Start auto-slide after data loads
    _startPackageAutoSlide();
    _startActivityAutoSlide();
  }

  void _startPackageAutoSlide() {
    _packageTimer?.cancel();
    if (_trendingProducts.length > 1) {
      _packageTimer = Timer.periodic(const Duration(seconds: 4), (timer) {
        if (_trendingProducts.isNotEmpty) {
          int nextIndex = (_currentPackageIndex + 1) % _trendingProducts.length;
          _packagePageController.animateToPage(
            nextIndex,
            duration: const Duration(milliseconds: 500),
            curve: Curves.easeInOut,
          );
          setState(() {
            _currentPackageIndex = nextIndex;
          });
        }
      });
    }
  }

  void _startActivityAutoSlide() {
    _activityTimer?.cancel();
    if (_activities.length > 1) {
      _activityTimer = Timer.periodic(const Duration(seconds: 4), (timer) {
        if (_activities.isNotEmpty) {
          int nextIndex = (_currentActivityIndex + 1) % _activities.length;
          _activityPageController.animateToPage(
            nextIndex,
            duration: const Duration(milliseconds: 500),
            curve: Curves.easeInOut,
          );
          setState(() {
            _currentActivityIndex = nextIndex;
          });
        }
      });
    }
  }

  Future<void> _loadProducts() async {
    setState(() => _isLoading = true);
    try {
      final response = await ProductService.getProducts();
      if (response['success'] == true) {
        setState(() {
          _allProducts = response['products'] ?? [];
          _applySortAndFilter();
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() => _isLoading = false);
      print('❌ Error loading products: $e');
    }
  }

  void _applySortAndFilter() {
    List<dynamic> filtered = _allProducts;
    
    if (_searchQuery.isNotEmpty) {
      final query = _searchQuery.toLowerCase();
      filtered = filtered.where((product) {
        final name = (product['name'] ?? '').toLowerCase();
        final location = (product['location'] ?? '').toLowerCase();
        final description = (product['description'] ?? '').toLowerCase();
        return name.contains(query) || 
               location.contains(query) || 
               description.contains(query);
      }).toList();
    }
    
    switch (_selectedSort) {
      case 'price-low':
        filtered.sort((a, b) => (a['price'] ?? 0).compareTo(b['price'] ?? 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b['price'] ?? 0).compareTo(a['price'] ?? 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b['rating'] ?? 0).compareTo(a['rating'] ?? 0));
        break;
      case 'popular':
        filtered.sort((a, b) => (b['reviews'] ?? 0).compareTo(a['reviews'] ?? 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => (b['createdAt'] ?? '').compareTo(a['createdAt'] ?? ''));
        break;
    }
    
    setState(() {
      _products = filtered;
    });
  }

  Future<void> _loadFeaturedProducts() async {
    setState(() => _isLoadingFeatured = true);
    try {
      final response = await ProductService.getFeaturedProducts();
      if (response['success'] == true) {
        setState(() {
          _featuredProducts = response['products'] ?? [];
          _isLoadingFeatured = false;
        });
      }
    } catch (e) {
      setState(() => _isLoadingFeatured = false);
      print('❌ Error loading featured products: $e');
    }
  }

  Future<void> _loadTrendingProducts() async {
    setState(() => _isLoadingTrending = true);
    try {
      final response = await ProductService.getTrendingProducts();
      if (response['success'] == true) {
        setState(() {
          _trendingProducts = response['products'] ?? [];
          _isLoadingTrending = false;
        });
        // Restart auto-slide after loading
        _startPackageAutoSlide();
      }
    } catch (e) {
      setState(() => _isLoadingTrending = false);
      print('❌ Error loading trending products: $e');
    }
  }

  Future<void> _loadActivities() async {
    setState(() => _isLoadingActivities = true);
    try {
      final response = await ActivityService.getActivities();
      if (response['success'] == true) {
        setState(() {
          _activities = response['activities'] ?? [];
          _isLoadingActivities = false;
        });
        // Restart auto-slide after loading
        _startActivityAutoSlide();
      }
    } catch (e) {
      setState(() => _isLoadingActivities = false);
      print('❌ Error loading activities: $e');
    }
  }

  Future<void> _loadFeaturedActivities() async {
    try {
      final response = await ActivityService.getFeaturedActivities();
      if (response['success'] == true) {
        setState(() {
          _featuredActivities = response['activities'] ?? [];
        });
      }
    } catch (e) {
      print('❌ Error loading featured activities: $e');
    }
  }

  void _handleSearch(String query) {
    setState(() {
      _searchQuery = query;
      _applySortAndFilter();
    });
  }

  void _handleSort(String sortOption) {
    setState(() {
      _selectedSort = sortOption;
      _applySortAndFilter();
    });
  }

  Future<void> openWhatsApp() async {
    final Uri whatsappUrl = Uri.parse(
      'https://wa.me/917558002853?text=Hello%20SeaSoul'
    );
    if (await canLaunchUrl(whatsappUrl)) {
      await launchUrl(
        whatsappUrl,
        mode: LaunchMode.externalApplication,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> pages = [
      _buildHomeBody(),
      const ExplorePage(),
      _buildBookingsPlaceholder(),
      _buildWishlistPlaceholder(),
      const ProfilePage(),
    ];

    return Scaffold(
      appBar: _currentTab == 0
          ? AppBar(
              backgroundColor: const Color(0xFFF8FBFF).withOpacity(0.8),
              elevation: 0,
              automaticallyImplyLeading: false,
              titleSpacing: 20,
              toolbarHeight: 70,
              title: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: oceanBlue.withOpacity(0.2),
                        width: 2,
                      ),
                      image: const DecorationImage(
                        image: AssetImage('assets/images/image.png'),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Row(
                        children: [
                          SizedBox(width: 2),
                          Text(
                            'SEA SOUL',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: deepNavy,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
              actions: [
                Padding(
                  padding: const EdgeInsets.only(right: 12.0),
                  child: IconButton(
                    icon: const Icon(Icons.notifications_none, color: deepNavy),
                    onPressed: () {},
                  ),
                ),
              ],
            )
          : null,
      body: IndexedStack(index: _currentTab, children: pages),
      floatingActionButton: FloatingActionButton(
        onPressed: openWhatsApp,
        backgroundColor: const Color(0xFF25D366).withOpacity(0.9),
        elevation: 6,
        shape: const CircleBorder(),
        child: const Icon(
          Icons.chat_bubble_outline,
          color: Colors.white,
          size: 26,
        ),
      ),
      bottomNavigationBar: Bottomnav(
        currentIndex: _currentTab,
        onTabSelected: (index) {
          setState(() {
            _currentTab = index;
          });
        },
      ),
    );
  }

  Widget _buildHomeBody() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20.0),
      physics: const BouncingScrollPhysics(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 12),
          _buildSearchBar(),
          const SizedBox(height: 24),
          _buildHeroSection(),
          const SizedBox(height: 32),
          _buildCategoriesSection(),
          const SizedBox(height: 32),
          _buildPackagesSection(),
          const SizedBox(height: 32),
          _buildActivitiesSection(),
          const SizedBox(height: 32),
          _buildBentoGridSection(),
          const SizedBox(height: 100),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.7),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.3)),
        boxShadow: [
          BoxShadow(
            color: deepNavy.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          const Padding(
            padding: EdgeInsets.only(left: 16),
            child: Icon(Icons.search, color: outline),
          ),
          Expanded(
            child: TextField(
              onChanged: _handleSearch,
              decoration: const InputDecoration(
                hintText: 'Search destinations, resorts...',
                hintStyle: TextStyle(
                  color: outline,
                  fontFamily: 'Inter',
                  fontSize: 15,
                ),
                border: InputBorder.none,
                contentPadding: EdgeInsets.symmetric(vertical: 16, horizontal: 12),
              ),
            ),
          ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.sort, color: outline),
            onSelected: _handleSort,
            itemBuilder: (context) => _sortOptions.map((key) {
              return PopupMenuItem(
                value: key,
                child: Row(
                  children: [
                    Icon(_sortIcons[key], size: 18, color: oceanBlue),
                    const SizedBox(width: 10),
                    Text(_sortLabels[key] ?? key),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildHeroSection() {
    if (_isLoadingFeatured) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(20.0),
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (_featuredProducts.isEmpty && _featuredActivities.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(32),
          border: Border.all(color: Colors.grey.shade200),
        ),
        child: Column(
          children: [
            const Icon(Icons.image_not_supported, size: 48, color: Colors.grey),
            const SizedBox(height: 12),
            const Text(
              'No featured items available',
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () {
                _loadFeaturedProducts();
                _loadFeaturedActivities();
              },
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    final featuredItem = _featuredProducts.isNotEmpty 
        ? _featuredProducts[0] 
        : (_featuredActivities.isNotEmpty ? _featuredActivities[0] : null);
    
    if (featuredItem == null) {
      return const SizedBox.shrink();
    }

    final images = featuredItem['images'] ?? [];
    final imageUrl = images.isNotEmpty ? images[0] : 
        'https://via.placeholder.com/400x300';
    
    final isProduct = _featuredProducts.isNotEmpty;
    final itemId = featuredItem['_id'];
    final itemName = featuredItem['name'] ?? 'Featured';
    final itemDescription = featuredItem['description'] ?? '';
    final itemDuration = featuredItem['duration'] ?? '4 Days / 3 Nights';
    final itemPrice = featuredItem['price'] ?? 0;

    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Featured Discoveries',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: deepNavy,
              ),
            ),
            TextButton(
              onPressed: () {
                setState(() {
                  _currentTab = 1;
                });
              },
              child: const Text(
                'View All',
                style: TextStyle(color: oceanBlue, fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        AspectRatio(
          aspectRatio: 4 / 5,
          child: GestureDetector(
            onTap: () {
              if (isProduct) {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => ProductDetailsPage(
                      productId: itemId,
                    ),
                  ),
                );
              } else {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => ActivityDetailsPage(
                      activityId: itemId,
                    ),
                  ),
                );
              }
            },
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(32),
                image: DecorationImage(
                  image: NetworkImage(imageUrl),
                  fit: BoxFit.cover,
                ),
              ),
              child: Stack(
                children: [
                  Positioned.fill(
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(32),
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [Colors.transparent, deepNavy.withOpacity(0.8)],
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    left: 16,
                    right: 16,
                    bottom: 16,
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(24),
                      child: BackdropFilter(
                        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                        child: Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.75),
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(
                              color: Colors.white.withOpacity(0.4),
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: sunsetOrange.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  isProduct ? 'FEATURED' : 'ACTIVITY',
                                  style: const TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: sunsetOrange,
                                    letterSpacing: 1.1,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                itemName,
                                style: const TextStyle(
                                  fontSize: 26,
                                  fontWeight: FontWeight.bold,
                                  color: deepNavy,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                itemDescription,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontSize: 13,
                                  color: outline,
                                  fontFamily: 'Inter',
                                ),
                              ),
                              const SizedBox(height: 16),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      const Icon(
                                        Icons.calendar_today_outlined,
                                        size: 16,
                                        color: oceanBlue,
                                      ),
                                      const SizedBox(width: 6),
                                      Text(
                                        itemDuration,
                                        style: const TextStyle(
                                          color: oceanBlue,
                                          fontWeight: FontWeight.w600,
                                          fontSize: 13,
                                        ),
                                      ),
                                    ],
                                  ),
                                  ElevatedButton(
                                    onPressed: () {
                                      if (isProduct) {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                            builder: (context) => ProductDetailsPage(
                                              productId: itemId,
                                            ),
                                          ),
                                        );
                                      } else {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                            builder: (context) => ActivityDetailsPage(
                                              activityId: itemId,
                                            ),
                                          ),
                                        );
                                      }
                                    },
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: oceanBlue,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(20),
                                      ),
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 20,
                                        vertical: 12,
                                      ),
                                      elevation: 0,
                                    ),
                                    child: const Text(
                                      'Explore',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCategoriesSection() {
    final categories = [
      {'icon': Icons.domain, 'label': 'Resorts', 'color': oceanBlue},
      {
        'icon': Icons.kayaking,
        'label': 'Activities',
        'color': const Color(0xFF006B5C),
      },
      {
        'icon': Icons.scuba_diving,
        'label': 'Scuba',
        'color': const Color(0xFF7F5300),
      },
      {
        'icon': Icons.favorite_border,
        'label': 'Honeymoon',
        'color': const Color(0xFFBA1A1A),
      },
      {'icon': Icons.restaurant, 'label': 'Dining', 'color': outline},
    ];

    return SizedBox(
      height: 95,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: categories.length,
        itemBuilder: (context, index) {
          final cat = categories[index];
          return Padding(
            padding: const EdgeInsets.only(right: 20.0),
            child: GestureDetector(
              onTap: () {
                setState(() {
                  _currentTab = 1;
                });
              },
              child: Column(
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: (cat['color'] as Color).withOpacity(0.12),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Icon(
                      cat['icon'] as IconData,
                      color: cat['color'] as Color,
                      size: 28,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    cat['label'] as String,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: deepNavy,
                      fontFamily: 'Inter',
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildPackagesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Popular Packages',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: deepNavy,
              ),
            ),
            IconButton(
              icon: const Icon(Icons.arrow_forward_ios, size: 16, color: outline),
              onPressed: () {
                setState(() {
                  _currentTab = 1;
                });
              },
            ),
          ],
        ),
        const SizedBox(height: 16),
        if (_isLoadingTrending)
          const Center(
            child: Padding(
              padding: EdgeInsets.all(20.0),
              child: CircularProgressIndicator(),
            ),
          )
        else if (_trendingProducts.isEmpty)
          const Padding(
            padding: EdgeInsets.all(20.0),
            child: Text('No packages available'),
          )
        else
          SizedBox(
            height: 280,
            child: Column(
              children: [
                Expanded(
                  child: PageView.builder(
                    controller: _packagePageController,
                    onPageChanged: (index) {
                      setState(() {
                        _currentPackageIndex = index;
                        // Reset timer on manual swipe
                        _packageTimer?.cancel();
                        _startPackageAutoSlide();
                      });
                    },
                    itemCount: _trendingProducts.length,
                    itemBuilder: (context, index) {
                      final pkg = _trendingProducts[index];
                      final images = pkg['images'] ?? [];
                      final imageUrl = images.isNotEmpty ? images[0] : 
                          'https://via.placeholder.com/300x200';
                      
                      return GestureDetector(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => ProductDetailsPage(
                                productId: pkg['_id'],
                              ),
                            ),
                          );
                        },
                        child: Container(
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(20),
                            image: DecorationImage(
                              image: NetworkImage(imageUrl),
                              fit: BoxFit.cover,
                            ),
                          ),
                          child: Stack(
                            children: [
                              Positioned.fill(
                                child: Container(
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(20),
                                    gradient: LinearGradient(
                                      begin: Alignment.topCenter,
                                      end: Alignment.bottomCenter,
                                      colors: [
                                        Colors.transparent,
                                        Colors.black.withOpacity(0.7),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                              Positioned(
                                bottom: 16,
                                left: 16,
                                right: 16,
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        const Icon(
                                          Icons.star,
                                          color: sunsetOrange,
                                          size: 16,
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          pkg['rating']?.toString() ?? '4.5',
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 14,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 8,
                                            vertical: 2,
                                          ),
                                          decoration: BoxDecoration(
                                            color: sunsetOrange.withOpacity(0.3),
                                            borderRadius: BorderRadius.circular(10),
                                          ),
                                          child: Text(
                                            pkg['category'] ?? 'Package',
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontSize: 10,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      pkg['name'] ?? 'Package',
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    Text(
                                      pkg['location'] ?? 'Location',
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        color: Colors.white.withOpacity(0.8),
                                        fontSize: 13,
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        RichText(
                                          text: TextSpan(
                                            text: '₹${pkg['price'] ?? 0}',
                                            style: const TextStyle(
                                              fontSize: 20,
                                              fontWeight: FontWeight.bold,
                                              color: oceanBlue,
                                            ),
                                            children: const [
                                              TextSpan(
                                                text: ' /person',
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  color: Colors.white70,
                                                  fontWeight: FontWeight.normal,
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
                                            color: oceanBlue,
                                            borderRadius: BorderRadius.circular(20),
                                          ),
                                          child: const Text(
                                            'View',
                                            style: TextStyle(
                                              color: Colors.white,
                                              fontWeight: FontWeight.w600,
                                              fontSize: 12,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
                // Dot indicator
                if (_trendingProducts.length > 1)
                  Padding(
                    padding: const EdgeInsets.only(top: 8.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(
                        _trendingProducts.length,
                        (index) => Container(
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          width: _currentPackageIndex == index ? 20 : 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: _currentPackageIndex == index 
                                ? oceanBlue 
                                : Colors.grey.shade300,
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildActivitiesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Trending Activities',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: deepNavy,
              ),
            ),
            IconButton(
              icon: const Icon(Icons.arrow_forward_ios, size: 16, color: outline),
              onPressed: () {
                setState(() {
                  _currentTab = 1;
                });
              },
            ),
          ],
        ),
        const SizedBox(height: 16),
        if (_isLoadingActivities)
          const Center(
            child: Padding(
              padding: EdgeInsets.all(20.0),
              child: CircularProgressIndicator(),
            ),
          )
        else if (_activities.isEmpty)
          const Padding(
            padding: EdgeInsets.all(20.0),
            child: Text('No activities available'),
          )
        else
          SizedBox(
            height: 270,
            child: Column(
              children: [
                Expanded(
                  child: PageView.builder(
                    controller: _activityPageController,
                    onPageChanged: (index) {
                      setState(() {
                        _currentActivityIndex = index;
                        // Reset timer on manual swipe
                        _activityTimer?.cancel();
                        _startActivityAutoSlide();
                      });
                    },
                    itemCount: _activities.length,
                    itemBuilder: (context, index) {
                      final activity = _activities[index];
                      final images = activity['images'] ?? [];
                      final imageUrl = images.isNotEmpty ? images[0] : 
                          'https://via.placeholder.com/300x200';
                      
                      return GestureDetector(
                        onTap: () {
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
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(20),
                            image: DecorationImage(
                              image: NetworkImage(imageUrl),
                              fit: BoxFit.cover,
                            ),
                          ),
                          child: Stack(
                            children: [
                              Positioned.fill(
                                child: Container(
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(20),
                                    gradient: LinearGradient(
                                      begin: Alignment.topCenter,
                                      end: Alignment.bottomCenter,
                                      colors: [
                                        Colors.transparent,
                                        Colors.black.withOpacity(0.7),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                              Positioned(
                                top: 12,
                                right: 12,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 10,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.9),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    '₹${activity['price'] ?? 0}',
                                    style: const TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                      color: oceanBlue,
                                    ),
                                  ),
                                ),
                              ),
                              Positioned(
                                top: 12,
                                left: 12,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.9),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    activity['category'] ?? 'Activity',
                                    style: const TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w600,
                                      color: deepNavy,
                                    ),
                                  ),
                                ),
                              ),
                              Positioned(
                                bottom: 16,
                                left: 16,
                                right: 16,
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      activity['name'] ?? 'Activity',
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    Text(
                                      activity['location'] ?? 'Location',
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        color: Colors.white.withOpacity(0.8),
                                        fontSize: 13,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        const Icon(
                                          Icons.access_time,
                                          color: Colors.white70,
                                          size: 14,
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          activity['duration'] ?? '2 hours',
                                          style: const TextStyle(
                                            fontSize: 12,
                                            color: Colors.white70,
                                          ),
                                        ),
                                        const SizedBox(width: 12),
                                        const Icon(
                                          Icons.people_outline,
                                          color: Colors.white70,
                                          size: 14,
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          'Max ${activity['maxParticipants'] ?? 10}',
                                          style: const TextStyle(
                                            fontSize: 12,
                                            color: Colors.white70,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 12,
                                        vertical: 6,
                                      ),
                                      decoration: BoxDecoration(
                                        color: oceanBlue,
                                        borderRadius: BorderRadius.circular(20),
                                      ),
                                      child: const Text(
                                        'Book Now',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.w600,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
                // Dot indicator
                if (_activities.length > 1)
                  Padding(
                    padding: const EdgeInsets.only(top: 8.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(
                        _activities.length,
                        (index) => Container(
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          width: _currentActivityIndex == index ? 20 : 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: _currentActivityIndex == index 
                                ? oceanBlue 
                                : Colors.grey.shade300,
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildBentoGridSection() {
    List<dynamic> latestProducts = List.from(_allProducts);
    latestProducts.sort((a, b) => (b['createdAt'] ?? '').compareTo(a['createdAt'] ?? ''));
    latestProducts = latestProducts.take(3).toList();

    if (latestProducts.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Discover the Archipelago',
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: deepNavy,
          ),
        ),
        const SizedBox(height: 16),
        GestureDetector(
          onTap: () {
            final product = latestProducts[0];
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => ProductDetailsPage(
                  productId: product['_id'],
                ),
              ),
            );
          },
          child: Container(
            height: 180,
            width: double.infinity,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              image: latestProducts[0]['images'] != null && latestProducts[0]['images'].isNotEmpty
                  ? DecorationImage(
                      image: NetworkImage(latestProducts[0]['images'][0]),
                      fit: BoxFit.cover,
                    )
                  : const DecorationImage(
                      image: NetworkImage('https://via.placeholder.com/400x200'),
                      fit: BoxFit.cover,
                    ),
            ),
            child: Stack(
              children: [
                Positioned.fill(
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(24),
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [Colors.transparent, Colors.black.withOpacity(0.65)],
                      ),
                    ),
                  ),
                ),
                Positioned(
                  left: 16,
                  bottom: 16,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        latestProducts[0]['name'] ?? 'Product',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        latestProducts[0]['location'] ?? 'Location',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.8),
                          fontSize: 13,
                          fontFamily: 'Inter',
                        ),
                      ),
                    ],
                  ),
                ),
                Positioned(
                  top: 12,
                  right: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFB84D).withOpacity(0.9),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '₹${latestProducts[0]['price'] ?? 0}',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 14),
        Row(
          children: [
            if (latestProducts.length > 1)
              Expanded(
                child: GestureDetector(
                  onTap: () {
                    final product = latestProducts[1];
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => ProductDetailsPage(
                          productId: product['_id'],
                        ),
                      ),
                    );
                  },
                  child: Container(
                    height: 220,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(24),
                      image: latestProducts[1]['images'] != null && latestProducts[1]['images'].isNotEmpty
                          ? DecorationImage(
                              image: NetworkImage(latestProducts[1]['images'][0]),
                              fit: BoxFit.cover,
                            )
                          : const DecorationImage(
                              image: NetworkImage('https://via.placeholder.com/300x200'),
                              fit: BoxFit.cover,
                            ),
                    ),
                    child: Stack(
                      children: [
                        Positioned.fill(
                          child: Container(
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(24),
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [Colors.transparent, Colors.black.withOpacity(0.65)],
                              ),
                            ),
                          ),
                        ),
                        Positioned(
                          left: 12,
                          bottom: 12,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                latestProducts[1]['name'] ?? 'Product',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                latestProducts[1]['location'] ?? 'Location',
                                style: TextStyle(
                                  color: Colors.white.withOpacity(0.8),
                                  fontSize: 12,
                                  fontFamily: 'Inter',
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            if (latestProducts.length > 2) const SizedBox(width: 14),
            if (latestProducts.length > 2)
              Expanded(
                child: GestureDetector(
                  onTap: () {
                    final product = latestProducts[2];
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => ProductDetailsPage(
                          productId: product['_id'],
                        ),
                      ),
                    );
                  },
                  child: Container(
                    height: 220,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(24),
                      image: latestProducts[2]['images'] != null && latestProducts[2]['images'].isNotEmpty
                          ? DecorationImage(
                              image: NetworkImage(latestProducts[2]['images'][0]),
                              fit: BoxFit.cover,
                            )
                          : const DecorationImage(
                              image: NetworkImage('https://via.placeholder.com/300x200'),
                              fit: BoxFit.cover,
                            ),
                    ),
                    child: Stack(
                      children: [
                        Positioned.fill(
                          child: Container(
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(24),
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [Colors.transparent, Colors.black.withOpacity(0.65)],
                              ),
                            ),
                          ),
                        ),
                        Positioned(
                          left: 12,
                          bottom: 12,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                latestProducts[2]['name'] ?? 'Product',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                latestProducts[2]['location'] ?? 'Location',
                                style: TextStyle(
                                  color: Colors.white.withOpacity(0.8),
                                  fontSize: 12,
                                  fontFamily: 'Inter',
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
          ],
        ),
      ],
    );
  }

  Widget _buildPlaceholderPage({
    required IconData icon,
    required String title,
    required String subtitle,
    required String buttonText,
    required VoidCallback onButtonPressed,
  }) {
    return Container(
      color: const Color(0xFFF8FBFF),
      child: Center(
        child: SingleChildScrollView(
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
                child: Icon(icon, color: oceanBlue, size: 44),
              ),
              const SizedBox(height: 32),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.bold,
                  color: deepNavy,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                subtitle,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 14,
                  color: outline,
                  fontFamily: 'Inter',
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 36),
              ElevatedButton(
                onPressed: onButtonPressed,
                style: ElevatedButton.styleFrom(
                  backgroundColor: oceanBlue,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(24),
                  ),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 16,
                  ),
                  elevation: 0,
                ),
                child: Text(
                  buttonText,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildWishlistPlaceholder() {
    return _buildPlaceholderPage(
      icon: Icons.favorite_border,
      title: 'My Wishlist',
      subtitle: 'Save your favorite lagoons and luxurious resorts to plan your next retreat.',
      buttonText: 'Browse Islands',
      onButtonPressed: () {
        setState(() {
          _currentTab = 1;
        });
      },
    );
  }

  Widget _buildBookingsPlaceholder() {
    return _buildPlaceholderPage(
      icon: Icons.confirmation_number_outlined,
      title: 'My Bookings',
      subtitle: 'Your upcoming premium island escapes will appear here.',
      buttonText: 'Explore Destinations',
      onButtonPressed: () {
        setState(() {
          _currentTab = 1;
        });
      },
    );
  }
}