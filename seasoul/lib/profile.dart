import 'dart:ui';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../login.dart';
import '../edit_profile.dart';
import '../change_password.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  bool _isLoggingOut = false;
  bool _isLoading = true;
  Map<String, dynamic>? _userData;

  static const Color deepNavy = Color(0xFF1A2B49);
  static const Color oceanBlue = Color(0xFF0099CC);
  static const Color turquoiseLagoon = Color(0xFF00C2A8);
  static const Color sunsetOrange = Color(0xFFFFB84D);
  static const Color outline = Color(0xFF6E7880);
  static const Color sandWhite = Color(0xFFF8FBFF);
  static const Color errorColor = Color(0xFFBA1A1A);

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    setState(() => _isLoading = true);
    try {
      final userData = await ApiService.getUserData();
      setState(() {
        _userData = userData;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      print('Error loading user data: $e');
    }
  }

  void _logout() async {
    if (_isLoggingOut) return;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        title: const Text(
          'Logout',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: deepNavy,
          ),
        ),
        content: const Text(
          'Are you sure you want to logout?',
          style: TextStyle(
            fontSize: 16,
            color: outline,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Cancel',
              style: TextStyle(
                color: outline,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              await _performLogout();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: errorColor,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.symmetric(
                horizontal: 24,
                vertical: 12,
              ),
            ),
            child: const Text(
              'Logout',
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _performLogout() async {
    setState(() {
      _isLoggingOut = true;
    });

    try {
      await ApiService.deleteToken();

      if (mounted) {
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) => const login()),
          (route) => false,
        );
      }
    } catch (e) {
      print('❌ Error during logout: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error during logout: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isLoggingOut = false;
        });
      }
    }
  }

  String _getUserInitial(String name) {
    if (name.isEmpty) return '?';
    return name.trim()[0].toUpperCase();
  }

  bool _hasProfileImage(String? imageUrl) {
    if (imageUrl == null || imageUrl.isEmpty) return false;
    if (imageUrl.contains('default-avatar')) return false;
    return true;
  }

  @override
  Widget build(BuildContext context) {
    final String userName = _userData?['fullName'] ?? 'User';
    final String userEmail = _userData?['email'] ?? 'user@email.com';
    final String profileImage = _userData?['profileImage'] ?? 
        'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png';
    final String userInitial = _getUserInitial(userName);
    final bool hasImage = _hasProfileImage(profileImage);

    if (_isLoading) {
      return Container(
        color: sandWhite,
        child: const Center(
          child: CircularProgressIndicator(
            color: oceanBlue,
          ),
        ),
      );
    }

    return Container(
      color: sandWhite,
      child: SafeArea(
        bottom: true,
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20.0, 16.0, 20.0, 20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              _buildProfileHeaderSection(
                userName, 
                userEmail, 
                profileImage,
                userInitial,
                hasImage,
              ),
              const SizedBox(height: 32),
              _buildBentoSection(
                icon: Icons.person_outline,
                iconColor: oceanBlue,
                title: 'Account',
                items: [
                  _buildListActionRow(
                    label: 'Edit Profile',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => EditProfilePage(
                            userData: _userData ?? {},
                          ),
                        ),
                      ).then((_) => _loadUserData()); // ✅ Refresh after pop
                    },
                  ),
                  _buildListActionRow(
                    label: 'Change Password',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const ChangePasswordPage(),
                        ),
                      );
                    },
                  ),
                ],
              ),
              const SizedBox(height: 16),
              _buildBentoSection(
                icon: Icons.support_outlined,
                iconColor: turquoiseLagoon,
                title: 'Support',
                items: [
                  _buildListActionRow(
                    label: 'Help Center',
                    onTap: () {},
                  ),
                  _buildListActionRow(
                    label: 'Terms & Conditions',
                    onTap: () {},
                  ),
                  _buildListActionRow(
                    label: 'Privacy Policy',
                    onTap: () {},
                  ),
                ],
              ),
              const SizedBox(height: 24),
              _buildLogoutButton(),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProfileHeaderSection(
    String name,
    String email,
    String profileImage,
    String initial,
    bool hasImage,
  ) {
    return Column(
      children: [
        Stack(
          alignment: Alignment.bottomRight,
          children: [
            if (hasImage)
              Container(
                width: 110,
                height: 110,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: deepNavy.withOpacity(0.08),
                      blurRadius: 16,
                      offset: const Offset(0, 6),
                    ),
                  ],
                  border: Border.all(color: Colors.white, width: 4),
                  image: DecorationImage(
                    image: NetworkImage(profileImage),
                    fit: BoxFit.cover,
                    onError: (exception, stackTrace) {},
                  ),
                ),
              )
            else
              Container(
                width: 110,
                height: 110,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: oceanBlue.withOpacity(0.15),
                  boxShadow: [
                    BoxShadow(
                      color: deepNavy.withOpacity(0.08),
                      blurRadius: 16,
                      offset: const Offset(0, 6),
                    ),
                  ],
                  border: Border.all(color: oceanBlue.withOpacity(0.3), width: 4),
                ),
                child: Center(
                  child: Text(
                    initial,
                    style: TextStyle(
                      fontSize: 48,
                      fontWeight: FontWeight.bold,
                      color: oceanBlue,
                    ),
                  ),
                ),
              ),
            Positioned(
              bottom: 0,
              right: 0,
              child: GestureDetector(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => EditProfilePage(
                        userData: _userData ?? {},
                      ),
                    ),
                  ).then((_) => _loadUserData()); // ✅ Refresh after pop
                },
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: const BoxDecoration(
                    color: oceanBlue,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.edit,
                    color: Colors.white,
                    size: 18,
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        Text(
          name,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: deepNavy,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          email,
          style: TextStyle(
            fontSize: 14,
            color: outline,
            fontFamily: 'Inter',
          ),
        ),
      ],
    );
  }

  Widget _buildBentoSection({
    required IconData icon,
    required Color iconColor,
    required String title,
    required List<Widget> items,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.75),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.4)),
        boxShadow: [
          BoxShadow(
            color: deepNavy.withOpacity(0.03),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: iconColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: iconColor, size: 20),
              ),
              const SizedBox(width: 12),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: deepNavy,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: items.length,
            separatorBuilder: (context, index) => const Divider(
              color: Color(0xFFF1F3FF),
              thickness: 1,
              height: 16,
            ),
            itemBuilder: (context, index) => items[index],
          ),
        ],
      ),
    );
  }

  Widget _buildListActionRow({
    required String label,
    bool hasChevron = true,
    Widget? trailingWidget,
    VoidCallback? onTap,
  }) {
    return GestureDetector(
      onTap: onTap ?? () {},
      behavior: HitTestBehavior.opaque,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w500,
                color: Color(0xFF3E484F),
              ),
            ),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (trailingWidget != null) trailingWidget,
                if (hasChevron)
                  const Icon(
                    Icons.chevron_right,
                    color: Color(0xFFBDC8D0),
                    size: 20,
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLogoutButton() {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton.icon(
        onPressed: _isLoggingOut ? null : _logout,
        icon: _isLoggingOut
            ? const SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: errorColor,
                ),
              )
            : const Icon(Icons.logout, color: errorColor, size: 18),
        label: Text(
          _isLoggingOut ? 'Logging out...' : 'Logout',
          style: const TextStyle(
            color: errorColor,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        style: OutlinedButton.styleFrom(
          backgroundColor: Colors.white.withOpacity(0.7),
          side: BorderSide(color: errorColor.withOpacity(0.15)),
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          elevation: 0,
        ),
      ),
    );
  }
}