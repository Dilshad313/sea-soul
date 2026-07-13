import 'package:flutter/material.dart';
import 'package:seasoul/services/product_service.dart';
import 'package:seasoul/services/activity_service.dart';
import 'package:seasoul/ui/activity_details.dart';
import 'package:seasoul/ui/product_details.dart';
import 'package:seasoul/widgets/star_rating.dart';

class ExplorePage extends StatefulWidget {
  const ExplorePage({super.key});

  @override
  State<ExplorePage> createState() => _ExplorePageState();
}

class _ExplorePageState extends State<ExplorePage> {
  int _activeCategoryIndex = 0;
  String _searchQuery = '';
  List<dynamic> _products = [];
  List<dynamic> _activities = [];
  bool _isLoadingProducts = true;
  bool _isLoadingActivities = true;
  bool _showProducts = true;

  static const Color deepNavy = Color(0xFF1A2B49);
  static const Color oceanBlue = Color(0xFF0099CC);
  static const Color turquoiseLagoon = Color(0xFF00C2A8);
  static const Color outline = Color(0xFF6E7880);
  static const Color sandWhite = Color(0xFFF8FBFF);

  // ✅ Package Categories (Same as Admin)
  final List<String> _categories = [
    'All',
    'Resorts',
    'Activities',
    'Scuba',
    'Honeymoon',
    'Dining',
  ];

  @override
  void initState() {
    super.initState();
    _loadProducts();
    _loadActivities();
  }

  Future<void> _loadProducts() async {
    setState(() => _isLoadingProducts = true);
    try {
      final response = await ProductService.getProducts();
      if (response['success'] == true) {
        setState(() {
          _products = response['products'] ?? [];
          _isLoadingProducts = false;
        });
      }
    } catch (e) {
      setState(() => _isLoadingProducts = false);
      print('❌ Error loading products: $e');
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
      }
    } catch (e) {
      setState(() => _isLoadingActivities = false);
      print('❌ Error loading activities: $e');
    }
  }

  List<dynamic> _getFilteredItems() {
    final items = _showProducts ? _products : _activities;
    final category = _categories[_activeCategoryIndex];

    return items.where((item) {
      // Category filter
      if (category != 'All' && item['category'] != category) {
        return false;
      }
      // Search filter
      if (_searchQuery.isNotEmpty) {
        final name = (item['name'] ?? '').toLowerCase();
        final location = (item['location'] ?? '').toLowerCase();
        final query = _searchQuery.toLowerCase();
        if (!name.contains(query) && !location.contains(query)) {
          return false;
        }
      }
      return true;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final filteredItems = _getFilteredItems();
    final isLoading = _showProducts ? _isLoadingProducts : _isLoadingActivities;
    final emptyMessage = _showProducts
        ? 'No packages found'
        : 'No activities found';

    return Container(
      color: sandWhite,
      child: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(20.0, 16.0, 20.0, 8.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Explore Destinations',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: deepNavy,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Discover the pristine jewels of the Arabian Sea',
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 14,
                      color: outline,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildToggleButtons(),
                  const SizedBox(height: 12),
                  _buildSearchBar(),
                ],
              ),
            ),
            // Category Chips
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: _buildCategoryChips(),
            ),
            const SizedBox(height: 16),
            // Content
            Expanded(
              child: isLoading
                  ? const Center(
                      child: CircularProgressIndicator(color: oceanBlue),
                    )
                  : filteredItems.isEmpty
                  ? _buildEmptyState(emptyMessage)
                  : _buildItemGrid(filteredItems),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildToggleButtons() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Expanded(
            child: GestureDetector(
              onTap: () {
                setState(() {
                  _showProducts = true;
                  _activeCategoryIndex = 0;
                });
              },
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: _showProducts ? oceanBlue : Colors.transparent,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Text(
                  'Packages',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: _showProducts ? Colors.white : deepNavy,
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
              ),
            ),
          ),
          Expanded(
            child: GestureDetector(
              onTap: () {
                setState(() {
                  _showProducts = false;
                  _activeCategoryIndex = 0;
                });
              },
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: !_showProducts ? oceanBlue : Colors.transparent,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Text(
                  'Activities',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: !_showProducts ? Colors.white : deepNavy,
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: deepNavy.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: TextField(
        onChanged: (value) {
          setState(() {
            _searchQuery = value;
          });
        },
        decoration: InputDecoration(
          prefixIcon: const Icon(Icons.search, color: outline),
          hintText: 'Search by name or location...',
          hintStyle: const TextStyle(
            color: outline,
            fontFamily: 'Inter',
            fontSize: 15,
          ),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(
            vertical: 14,
            horizontal: 16,
          ),
          suffixIcon: _searchQuery.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear, color: outline, size: 18),
                  onPressed: () {
                    setState(() {
                      _searchQuery = '';
                    });
                  },
                )
              : null,
        ),
      ),
    );
  }

  Widget _buildCategoryChips() {
    return SizedBox(
      height: 42,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: _categories.length,
        itemBuilder: (context, index) {
          final isSelected = _activeCategoryIndex == index;
          return Padding(
            padding: const EdgeInsets.only(right: 12.0),
            child: GestureDetector(
              onTap: () {
                setState(() {
                  _activeCategoryIndex = index;
                });
              },
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 10,
                ),
                decoration: BoxDecoration(
                  color: isSelected
                      ? oceanBlue
                      : turquoiseLagoon.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(999),
                  border: isSelected
                      ? null
                      : Border.all(color: turquoiseLagoon.withOpacity(0.1)),
                  boxShadow: isSelected
                      ? [
                          BoxShadow(
                            color: oceanBlue.withOpacity(0.2),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ]
                      : null,
                ),
                child: Text(
                  _categories[index],
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: isSelected ? Colors.white : turquoiseLagoon,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildEmptyState(String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            _showProducts ? Icons.inventory : Icons.kayaking,
            size: 64,
            color: Colors.grey[300],
          ),
          const SizedBox(height: 16),
          Text(
            message,
            style: TextStyle(fontSize: 16, color: Colors.grey[500]),
          ),
          const SizedBox(height: 8),
          TextButton(
            onPressed: () {
              if (_showProducts) {
                _loadProducts();
              } else {
                _loadActivities();
              }
            },
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  Widget _buildItemGrid(List<dynamic> items) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const BouncingScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 16,
          mainAxisSpacing: 24,
          childAspectRatio: 0.58,
        ),
        itemCount: items.length,
        itemBuilder: (context, index) {
          final item = items[index];
          final images = item['images'] ?? [];
          final imageUrl = images.isNotEmpty
              ? images[0]
              : 'https://via.placeholder.com/300x200';
          final isProduct = _showProducts;
          final itemId = item['_id'];
          final itemName = item['name'] ?? 'Item';
          final itemTagline = item['location'] ?? 'Location';
          final itemPrice = item['price'] ?? 0;

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Stack(
                  children: [
                    GestureDetector(
                      onTap: () {
                        if (isProduct) {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) =>
                                  ProductDetailsPage(productId: itemId),
                            ),
                          );
                        } else {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) =>
                                  ActivityDetailsPage(activityId: itemId),
                            ),
                          );
                        }
                      },
                      child: Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.06),
                              blurRadius: 6,
                              offset: const Offset(0, 3),
                            ),
                          ],
                          image: DecorationImage(
                            image: NetworkImage(imageUrl),
                            fit: BoxFit.cover,
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
                          '₹$itemPrice',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: oceanBlue,
                          ),
                        ),
                      ),
                    ),
                    if (item['isFeatured'] == true)
                      Positioned(
                        top: 12,
                        left: 12,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFB84D).withOpacity(0.9),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Text(
                            'FEATURED',
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4.0),
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
                    Text(
                      itemTagline,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 12,
                        color: outline,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'STARTING',
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.8,
                        color: outline.withOpacity(0.7),
                      ),
                    ),
                    Text(
                      '₹$itemPrice',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: oceanBlue,
                      ),
                    ),
                    const SizedBox(height: 10),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton(
                        onPressed: () {
                          if (isProduct) {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) =>
                                    ProductDetailsPage(productId: itemId),
                              ),
                            );
                          } else {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) =>
                                    ActivityDetailsPage(activityId: itemId),
                              ),
                            );
                          }
                        },
                        style: OutlinedButton.styleFrom(
                          backgroundColor: oceanBlue.withOpacity(0.05),
                          side: BorderSide(color: oceanBlue.withOpacity(0.1)),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                        ),
                        child: const Text(
                          'View Details',
                          style: TextStyle(
                            color: oceanBlue,
                            fontWeight: FontWeight.w600,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
