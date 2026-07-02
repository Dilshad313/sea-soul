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
  State<ProfilePage> createState() => profile();
}

class profile extends State<ProfilePage> {
  bool _isBiometricLoginEnabled = true;
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

  @override
  Widget build(BuildContext context) {
    final String userName = _userData?['fullName'] ?? 'User';
    final String userEmail = _userData?['email'] ?? 'user@email.com';
    final String userPhone = _userData?['phone'] ?? '+91 0000000000';
    final String userBio = _userData?['bio'] ?? '';
    final String userLocation = _userData?['location'] ?? '';
    final String profileImage = _userData?['profileImage'] ?? 
        'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png';

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
        bottom: false,
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20.0, 16.0, 20.0, 120.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              _buildProfileHeaderSection(
                userName, 
                userEmail, 
                userPhone, 
                userBio, 
                userLocation,
                profileImage,
              ),
              const SizedBox(height: 32),

              _buildBentoSection(
                icon: Icons.person_outline,
                iconColor: oceanBlue,
                title: 'Personal Information',
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
                      ).then((_) => _loadUserData());
                    },
                  ),
                  _buildListActionRow(label: 'Saved Travelers'),
                ],
              ),
              const SizedBox(height: 16),
              _buildBentoSection(
                icon: Icons.folder_shared_outlined,
                iconColor: turquoiseLagoon,
                title: 'Documents & Permits',
                items: [
                  _buildListActionRow(
                    label: 'ID Vault',
                    trailingWidget: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE0E8FF),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        'ENCRYPTED',
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF007262),
                        ),
                      ),
                    ),
                  ),
                  _buildListActionRow(label: 'Entry Permits'),
                ],
              ),
              const SizedBox(height: 16),
              _buildBentoSection(
                icon: Icons.security_outlined,
                iconColor: sunsetOrange,
                title: 'Security',
                items: [
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
                  _buildListActionRow(
                    label: 'Biometric Login',
                    hasChevron: false,
                    trailingWidget: Transform.scale(
                      scale: 0.85,
                      child: CupertinoSwitch(
                        activeColor: turquoiseLagoon,
                        value: _isBiometricLoginEnabled,
                        onChanged: (value) {
                          setState(() {
                            _isBiometricLoginEnabled = value;
                          });
                        },
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              _buildBentoSection(
                icon: Icons.tune_outlined,
                iconColor: deepNavy,
                title: 'Preferences',
                items: [
                  _buildListActionRow(
                    label: 'Language',
                    trailingWidget: const Padding(
                      padding: EdgeInsets.only(right: 6.0),
                      child: Text(
                        'English',
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 14,
                          color: outline,
                        ),
                      ),
                    ),
                  ),
                  _buildListActionRow(label: 'Notifications'),
                ],
              ),
              const SizedBox(height: 16),
              _buildBentoSection(
                icon: Icons.contact_support_outlined,
                iconColor: oceanBlue,
                title: 'Support & Legal',
                items: [
                  _buildListActionRow(label: 'Help Center'),
                  _buildListActionRow(label: 'Terms of Service'),
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
    String phone,
    String bio,
    String location,
    String profileImage,
  ) {
    return Column(
      children: [
        Stack(
          alignment: Alignment.bottomRight,
          children: [
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
                  onError: (exception, stackTrace) {
                    // If image fails to load, show default
                  },
                ),
              ),
            ),
            Positioned(
              bottom: 2,
              right: 2,
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: const BoxDecoration(
                  color: turquoiseLagoon,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.verified,
                  color: Colors.white,
                  size: 16,
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
        const SizedBox(height: 4),
        Text(
          phone,
          style: TextStyle(
            fontSize: 14,
            color: outline,
            fontFamily: 'Inter',
          ),
        ),
        if (location.isNotEmpty) ...[
          const SizedBox(height: 4),
          Text(
            location,
            style: TextStyle(
              fontSize: 14,
              color: outline,
              fontFamily: 'Inter',
            ),
          ),
        ],
        if (bio.isNotEmpty) ...[
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: oceanBlue.withOpacity(0.05),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: oceanBlue.withOpacity(0.1),
              ),
            ),
            child: Text(
              bio,
              style: TextStyle(
                fontSize: 13,
                color: outline,
                fontFamily: 'Inter',
                height: 1.4,
              ),
              textAlign: TextAlign.center,
            ),
          ),
        ],
        const SizedBox(height: 6),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
          decoration: BoxDecoration(
            color: oceanBlue.withOpacity(0.1),
            borderRadius: BorderRadius.circular(99),
          ),
          child: const Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.workspace_premium, color: oceanBlue, size: 16),
              SizedBox(width: 6),
              Text(
                'Premium Member',
                style: TextStyle(
                  color: oceanBlue,
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
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