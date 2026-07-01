import 'package:flutter/material.dart';
import 'package:seasoul/explore_details.dart';

class ExplorePage extends StatefulWidget {
  const ExplorePage({super.key});

  @override
  State<ExplorePage> createState() => _ExplorePageState();
}

class _ExplorePageState extends State<ExplorePage> {
  int _activeCategoryIndex = 0;

  static const Color deepNavy = Color(0xFF1A2B49);
  static const Color oceanBlue = Color(0xFF0099CC);
  static const Color turquoiseLagoon = Color(0xFF00C2A8);
  static const Color outline = Color(0xFF6E7880);
  static const Color sandWhite = Color(0xFFF8FBFF);

  final List<String> _categories = [
    'All Islands',
    'Lagoons',
    'Diving Spots',
    'Resorts',
  ];

  final List<Map<String, String>> _islands = [
    {
      'name': 'Kavaratti',
      'tagline': 'The Administrative Hub',
      'price': '₹8,500',
      'image':
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAHOKsCqKcDXNw7U0USBF-1H03oE4dpy95Gy5rroXPKbawm76a1cNg_BxkbAPMO4WWoMvpTQqR6kBvi9T1k34CQTE9O9E4M9nYxKEJDEFPh50m5U7eiWxLG7KxIxesGQlURjIOVlepuuAsXshUDdfekF9d0UCe5EwozrjOEYAm7TiafVozltjzctOs6JHHJblnJ8QZsKkwUAFJvHb4UDCmcgr_HRISTNEB4SPWzN7F0UUwr6vYwQNErfjHD1Nu2GNNVGF3rQOfWTh0',
      'hasFavorite': 'true',
    },
    {
      'name': 'Agatti',
      'tagline': 'The Gateway to Isles',
      'price': '₹12,200',
      'image':
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAwKQspMUUPk7RZLdz2DJ_Xqzpjccf26KudbRCAsQFFG2jNHcYO0ufir2d4X7YWJ7n-u_u3TLsBn3yqzuYRystArevb8ANtsahgypNZJWT39xPdvvdxQx5GRlh2rjfysVlqyD0kRlXXPCFw4u4OzJeTXwoIBcBKn_1dGSOAa4fC3NM3PzcWZvAOWSPvP4rvxjjwisE_6Tt5-VbigIPomLFqUCKd344Vl71sVX0oXxDEzd5sABY4ua_jlV6qkq-6eFQ0EFJd2lY3OfY',
      'hasFavorite': 'true',
    },
    {
      'name': 'Bangaram',
      'tagline': 'The Teardrop Island',
      'price': '₹15,000',
      'image':
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAGiwSlQyzqMOah5R2eVIVr4AGJBWQrx_EBaKrOz4ZYG6S0neEH84K3XsgbJaUZy6BRGUhWBsFpwhyzGRTR8Ql4v56I1sqjivXTBySFNiU4elIjN6_hYk72CgbbqUfTsomOKr6jkvZKd6hULWQo87Bc144QZDktE10UY8ds0qW9m02bkHm3IZ-GV9YDN-hY86TKn3J4h6nvNgCmfovZ2A7LfkS2RNmxT0E_2Cyj5DjqXxUgjKtYja_C2XQMl1Ti7vO1ihDRf20lcPE',
      'hasFavorite': 'false',
    },
    {
      'name': 'Minicoy',
      'tagline': 'Southern Heritage Isle',
      'price': '₹9,800',
      'image':
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCxH7Wq_DRGWKFW-XQsxfM5g1IjtnyIJl9ym-MoOWH1bLWXf8c4Gqi33TXOef_vsX4yk4wBVMg4UAkL3cXSnBCljFbiejWpllO-nwXt7ZwA4sqFqGCxq2BnT9A20wZk4CdXQ-ycHeS_TH2TY0RWOm0bXlcjAcYtP3xuOhIKyltDy7QKwQe0T1Jt9JBZuJNac0CSkQBPOdJVJy3TvsSo_JV3ZyUj3wquzOI91QDCZI9LPEF7bnbOmnmmqzX2bjp96kumnc6ddhcmLUc',
      'hasFavorite': 'false',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      color: sandWhite,
      child: SafeArea(
        bottom: false,
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20.0, 16.0, 20.0, 100.0),
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
              const SizedBox(height: 24),

              _buildSearchBar(),
              const SizedBox(height: 24),

              _buildCategoryChips(),
              const SizedBox(height: 20),

              _buildIslandGrid(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSearchBar() {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F3FF), 
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: deepNavy.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: const TextField(
        decoration: InputDecoration(
          prefixIcon: Icon(Icons.search, color: outline),
          hintText: 'Search islands, activities...',
          hintStyle: TextStyle(
            color: outline,
            fontFamily: 'Inter',
            fontSize: 15,
          ),
          border: InputBorder.none,
          contentPadding: EdgeInsets.symmetric(vertical: 16, horizontal: 16),
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

  Widget _buildIslandGrid() {
    return GridView.builder(
      shrinkWrap: true,
      physics:
           NeverScrollableScrollPhysics(),       itemCount: _islands.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 16,
        mainAxisSpacing: 24,
        childAspectRatio:
            0.58, 
      ),
      itemBuilder: (context, index) {
        final item = _islands[index];
        final isFav = item['hasFavorite'] == 'true';

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Stack(
                children: [
                  Container(
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
                        image: NetworkImage(item['image']!),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  if (isFav)
                    Positioned(
                      top: 12,
                      right: 12,
                      child: Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.4),
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: Colors.white.withOpacity(0.3),
                          ),
                        ),
                        child: const Icon(
                          Icons.favorite,
                          color: Colors.white,
                          size: 18,
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
                    item['name']!,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: deepNavy,
                    ),
                  ),
                  Text(
                    item['tagline']!,
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
                    item['price']!,
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
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => explore_details(),
                          ),
                        );
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
    );
  }
}
