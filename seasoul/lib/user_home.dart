import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:seasoul/bottomnav.dart';
import 'package:seasoul/explore.dart';
import 'package:seasoul/profile.dart';
import 'package:url_launcher/url_launcher.dart';

class UserHome extends StatefulWidget {
  const UserHome({super.key});

  @override
  State<UserHome> createState() => _UserHomeState();
}

class _UserHomeState extends State<UserHome> {
  int _currentTab = 0;

  static const Color deepNavy = Color(0xFF1A2B49);
  static const Color oceanBlue = Color(0xFF0099CC);
  static const Color sunsetOrange = Color(0xFFFFB84D);
  static const Color outline = Color(0xFF6E7880);
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
                        image: NetworkImage('assets/images/image.png'),
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
          _buildBentoGridSection(),
          const SizedBox(height: 100),
        ],
      ),
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
      subtitle:
          'Save your favorite lagoons and luxurious resorts to plan your next retreat.',
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
      child: const TextField(
        decoration: InputDecoration(
          prefixIcon: Icon(Icons.search, color: outline),
          hintText: 'Search destinations, resorts...',
          hintStyle: TextStyle(
            color: outline,
            fontFamily: 'Inter',    
            fontSize: 15,
          ),
          border: InputBorder.none,
          contentPadding: EdgeInsets.symmetric(vertical: 16),
        ),
      ),
    );
  }

  Widget _buildHeroSection() {
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
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(32),
              image: const DecorationImage(
                image: NetworkImage(
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuCwCL9eBRuEoIfri666e8oH5dr2cu5nFzw9bx2fQgX8RIqM-USKfugo0Q7WMjQP49JyDKp65ZqgmjxlceJt8ghBLvm8WMNqhIqzNRLZKBSmBz69YqPBH79py_8kigH-I8Rlw4ZUUZMIzk584SGoF8NkHwVhSOrRAVzCsSdjMD1Yo-SsymlouToaksj2Y3ubEugXG7Hl_FT24noIhyt1pTqYFXreayvMq6BRikwoJUD_JxDGCYY1S8VR_OemwObPJemKNp6QJ-IgZXg',
                ),
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
                              child: const Text(
                                'TRENDING NOW',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: sunsetOrange,
                                  letterSpacing: 1.1,
                                ),
                              ),
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              'Bangaram Atoll',
                              style: TextStyle(
                                fontSize: 26,
                                fontWeight: FontWeight.bold,
                                color: deepNavy,
                              ),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'Experience the teardrop-shaped paradise with uninhabited white sand beaches.',
                              style: TextStyle(
                                fontSize: 13,
                                color: outline,
                                fontFamily: 'Inter',
                              ),
                            ),
                            const SizedBox(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Row(
                                  children: [
                                    Icon(
                                      Icons.calendar_today_outlined,
                                      size: 16,
                                      color: oceanBlue,
                                    ),
                                    SizedBox(width: 6),
                                    Text(
                                      '4 Days / 3 Nights',
                                      style: TextStyle(
                                        color: oceanBlue,
                                        fontWeight: FontWeight.w600,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ],
                                ),
                                ElevatedButton(
                                  onPressed: () {
                                    setState(() {
                                      _currentTab = 1;
                                    });
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
          );
        },
      ),
    );
  }

  Widget _buildPackagesSection() {
    final packages = [
      {
        'title': 'Coral Bliss Retreat',
        'desc': 'Agatti Island • 3 Nights',
        'price': '₹45,000',
        'rating': '4.9',
        'img':
            'https://lh3.googleusercontent.com/aida-public/AB6AXuCLnrkmN5sc34GfjTtJXwhDxIAAIn0oZa6puXuWDFUM9IDYPwnyT5jBQ08iddmsTz4AZwcgfei846Y2RjO3CFyd35RSc2jyOnmr0yx2VxrrZlf_5mnu1VXOR6oljspdEjK_3h2TjiZ3CGm7VkUHoelgo3p_vHwoC9JDacPhvO4bHh0bE-9YHav8wRV-qoGBlUeRofen-kMTgui0jAyeRFYReRdCHtycMhTcGYx6qzt5BLpnE4rGS1pJdka5yT-apiFoEKN67P6nQxQ',
      },
      {
        'title': 'Ocean Explorer Expedition',
        'desc': 'Kavaratti • 5 Nights',
        'price': '₹62,500',
        'rating': '4.8',
        'img':
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBmT3W1cmAYFYN8yKD5xTw-doFRqg1Y7YT_cb1sSN6w8EwGx-RhWA7G-5VNAMOjBmOpwcRkU0IdMT88ojNOLaYz9FKyZCFM5abFZN2QHy4WZTOw6zZoxNXg52qr3vefbkTbtjNoSwc1M_WW_mUflVctt5J0ofIqdygrgHYBqaEBuoQaNvNg95zayYIW4M6ykc3tMTnVp28W6SLymnwB69S9DMViCwV-EQdyMXZRPolNRks_rI3NbuKuXRmTW6-vaLNJM9AikMJUpSs',
      },
    ];

    return Column(
      children: [
        const Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Popular Packages',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: deepNavy,
              ),
            ),
            Icon(Icons.arrow_forward_ios, size: 16, color: outline),
          ],
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 270,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: packages.length,
            itemBuilder: (context, index) {
              final pkg = packages[index];
              return Container(
                width: 260,
                margin: const EdgeInsets.only(right: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Stack(
                      children: [
                        Container(
                          height: 180,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(24),
                            image: DecorationImage(
                              image: NetworkImage(pkg['img']!),
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                        Positioned(
                          top: 12,
                          right: 12,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.9),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              children: [
                                const Icon(
                                  Icons.star,
                                  color: sunsetOrange,
                                  size: 14,
                                ),
                                const SizedBox(width: 2),
                                Text(
                                  pkg['rating']!,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: deepNavy,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      pkg['title']!,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: deepNavy,
                      ),
                    ),
                    Text(
                      pkg['desc']!,
                      style: const TextStyle(
                        fontSize: 13,
                        color: outline,
                        fontFamily: 'Inter',
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        RichText(
                          text: TextSpan(
                            text: pkg['price'],
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: oceanBlue,
                            ),
                            children: const [
                              TextSpan(
                                text: ' /person',
                                style: TextStyle(
                                  fontSize: 11,
                                  color: outline,
                                  fontWeight: FontWeight.normal,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          width: 36,
                          height: 36,
                          decoration: const BoxDecoration(
                            color: Color(0xFFE0E8FF),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.add,
                            color: oceanBlue,
                            size: 20,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildBentoGridSection() {
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

        _buildBentoItem(
          height: 180,
          title: 'Minicoy Island',
          subtitle: 'The Southern Gem',
          img:
              'https://lh3.googleusercontent.com/aida-public/AB6AXuBIpQza7Fq5P7IhFyo7jQ2ymqh0h6Lo8zZujNMUgf4XysRTSxNdF4jMkMq690PIYt2-8hICx-onxA_IwHi4Xv-qlnEQ4xggRsaGEKz6m-7_gHEiwDYQPF9oF_9WoBqwGFlXOq7xjFyVwiiCWijr_vw_stkUNSxCMeq5_m94SSyDdSVwYiGw9luqIAUCzkc159ZEAbsQ18PbIm1o3C6RHFFV6aK2AXyVP8CilQ-sG28j05kHUAuWlDcFUrTuVsGJ6hxf_00lffdivbA',
        ),
        const SizedBox(height: 14),

        Row(
          children: [
            Expanded(
              child: _buildBentoItem(
                height: 220,
                title: 'Kadmat',
                subtitle: 'Crystal Lagoon',
                img:
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuDHuj0r5Y8hetUGqSTACIwRiaRhi3-UVaXjKE_xAHUpCcPL5ySxXqInOogtdUN9IVelPfUPjQJG6OYJOF0iUxF73LjRnHeC6kXuYg9ug2JrpLn4cifMFYwCfj8qB6EhdIoz1-kGwJW-IXwYSg9Ww4engviOwrhuH-jyqj-kmEL2PDQGSkxyp8Aq_P_8KqzuSTur2NctTFwNUgQgHQXPbZ_ImtYeN2OBa8dUXExm8Qk9ZnhyNDrRdh1WjDCdsWHbRhwSQ6NkIV8xuQ4',
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: _buildBentoItem(
                height: 220,
                title: 'Kavaratti',
                subtitle: 'The Capital',
                img:
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuBDs1DW9BM_f-wuuZAH3Wo6zG_xol2WlYuTiCD6J7EKfgFpYt9iXwbDDsjvenhNcZsWCvOO1-LPxvDfHjSVwgEuGdmYg_9fGgtiOiGAcoR8b9L9wyXW8GcHMyNdH76lp102J4TsqO-pH0cISAYJxV79mhQI9s_g-34yajHEc9jeT6EtLCqYC8uZE4zPVjcjDDyQuREroLdByRnrq_BgpDYCmyi0beV4pkfjo-XdyK8N-ULshB3_ASnXaUzEpx2ByRrOJdXcx_psb8Q',
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildBentoItem({
    required double height,
    required String title,
    required String subtitle,
    required String img,
  }) {
    return Container(
      height: height,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        image: DecorationImage(image: NetworkImage(img), fit: BoxFit.cover),
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
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  subtitle,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.8),
                    fontSize: 13,
                    fontFamily: 'Inter',
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
