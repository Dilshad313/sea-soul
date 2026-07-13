import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:seasoul/ui/profile.dart';
import '../services/api_service.dart';
import '../constants/api_constants.dart';

class ChangePasswordPage extends StatefulWidget {
  const ChangePasswordPage({super.key});

  @override
  State<ChangePasswordPage> createState() => _ChangePasswordPageState();
}

class _ChangePasswordPageState extends State<ChangePasswordPage> {
  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  
  bool _isLoading = false;
  bool _obscureCurrent = true;
  bool _obscureNew = true;
  bool _obscureConfirm = true;

  @override
  void dispose() {
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _changePassword() async {
    if (_isLoading) return;

    final currentPassword = _currentPasswordController.text.trim();
    final newPassword = _newPasswordController.text.trim();
    final confirmPassword = _confirmPasswordController.text.trim();

    if (currentPassword.isEmpty || newPassword.isEmpty || confirmPassword.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please fill all fields'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    if (newPassword.length < 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('New password must be at least 6 characters'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    if (newPassword != confirmPassword) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Passwords do not match'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final data = {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      };

      final response = await ApiService.postWithToken(
        ApiConstants.changePassword,
        data,
      );

      if (response['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Password changed successfully!'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 3),
          ),
        );

        await Future.delayed(const Duration(milliseconds: 500));
        if (mounted) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => const ProfilePage()),
          );
        }
      } else {
        throw Exception(response['message'] ?? 'Password change failed');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    const colorBackground = Color(0xFF0D1516);
    const colorPrimaryContainer = Color(0xFF00E5FF);
    const colorOnSurfaceVariant = Color(0xFFBAC9CC);
    const colorOutline = Color(0xFF849396);
    const colorLowestSurface = Color(0xFF080F11);
    const deepNavy = Color(0xFF1A2B49);
    const sandWhite = Color(0xFFF8FBFF);

    return Scaffold(
      backgroundColor: sandWhite,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: deepNavy),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Change Password',
          style: TextStyle(
            color: deepNavy,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: Stack(
        children: [
          Positioned.fill(
            child: Container(
              decoration: const BoxDecoration(
                gradient: RadialGradient(
                  center: Alignment(-0.6, -0.4),
                  radius: 0.7,
                  colors: [Color(0x1400E5FF), Colors.transparent],
                ),
              ),
            ),
          ),
          Positioned.fill(
            child: Container(
              decoration: const BoxDecoration(
                gradient: RadialGradient(
                  center: Alignment(0.6, 0.4),
                  radius: 0.7,
                  colors: [Color(0x1459DBC7), Colors.transparent],
                ),
              ),
            ),
          ),
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(
                horizontal: 20.0,
                vertical: 20.0,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const SizedBox(height: 20),
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: colorPrimaryContainer.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.password,
                      color: colorPrimaryContainer,
                      size: 40,
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Change Password',
                    style: GoogleFonts.montserrat(
                      fontSize: 24,
                      fontWeight: FontWeight.w700,
                      color: deepNavy,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Enter your current password and new password.',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.montserrat(
                      fontSize: 14,
                      color: colorOnSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 40),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(24),
                    child: BackdropFilter(
                      filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
                      child: Container(
                        width: double.infinity,
                        constraints: const BoxConstraints(maxWidth: 440),
                        padding: const EdgeInsets.all(32.0),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.9),
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(
                            color: Colors.white.withOpacity(0.3),
                            width: 1,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'CURRENT PASSWORD',
                              style: GoogleFonts.montserrat(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: colorOutline,
                                letterSpacing: 1.0,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Container(
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: TextField(
                                controller: _currentPasswordController,
                                obscureText: _obscureCurrent,
                                style: GoogleFonts.montserrat(
                                  color: deepNavy,
                                  fontSize: 16,
                                ),
                                decoration: InputDecoration(
                                  hintText: 'Enter current password',
                                  hintStyle: GoogleFonts.montserrat(
                                    color: Colors.grey[400],
                                    fontSize: 16,
                                  ),
                                  prefixIcon: const Icon(
                                    Icons.lock_outline,
                                    color: colorOutline,
                                  ),
                                  suffixIcon: IconButton(
                                    icon: Icon(
                                      _obscureCurrent
                                          ? Icons.visibility_off
                                          : Icons.visibility,
                                      color: colorOutline,
                                    ),
                                    onPressed: () {
                                      setState(() {
                                        _obscureCurrent = !_obscureCurrent;
                                      });
                                    },
                                  ),
                                  filled: true,
                                  fillColor: colorLowestSurface.withOpacity(0.05),
                                  contentPadding: const EdgeInsets.symmetric(
                                    vertical: 18,
                                    horizontal: 16,
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: BorderSide(
                                      color: Colors.grey[300]!,
                                    ),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: const BorderSide(
                                      color: colorPrimaryContainer,
                                      width: 1.5,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 24),
                            Text(
                              'NEW PASSWORD',
                              style: GoogleFonts.montserrat(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: colorOutline,
                                letterSpacing: 1.0,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Container(
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: TextField(
                                controller: _newPasswordController,
                                obscureText: _obscureNew,
                                style: GoogleFonts.montserrat(
                                  color: deepNavy,
                                  fontSize: 16,
                                ),
                                decoration: InputDecoration(
                                  hintText: 'Enter new password',
                                  hintStyle: GoogleFonts.montserrat(
                                    color: Colors.grey[400],
                                    fontSize: 16,
                                  ),
                                  prefixIcon: const Icon(
                                    Icons.lock_outline,
                                    color: colorOutline,
                                  ),
                                  suffixIcon: IconButton(
                                    icon: Icon(
                                      _obscureNew
                                          ? Icons.visibility_off
                                          : Icons.visibility,
                                      color: colorOutline,
                                    ),
                                    onPressed: () {
                                      setState(() {
                                        _obscureNew = !_obscureNew;
                                      });
                                    },
                                  ),
                                  filled: true,
                                  fillColor: colorLowestSurface.withOpacity(0.05),
                                  contentPadding: const EdgeInsets.symmetric(
                                    vertical: 18,
                                    horizontal: 16,
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: BorderSide(
                                      color: Colors.grey[300]!,
                                    ),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: const BorderSide(
                                      color: colorPrimaryContainer,
                                      width: 1.5,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 24),
                            Text(
                              'CONFIRM PASSWORD',
                              style: GoogleFonts.montserrat(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: colorOutline,
                                letterSpacing: 1.0,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Container(
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: TextField(
                                controller: _confirmPasswordController,
                                obscureText: _obscureConfirm,
                                style: GoogleFonts.montserrat(
                                  color: deepNavy,
                                  fontSize: 16,
                                ),
                                decoration: InputDecoration(
                                  hintText: 'Confirm new password',
                                  hintStyle: GoogleFonts.montserrat(
                                    color: Colors.grey[400],
                                    fontSize: 16,
                                  ),
                                  prefixIcon: const Icon(
                                    Icons.lock_outline,
                                    color: colorOutline,
                                  ),
                                  suffixIcon: IconButton(
                                    icon: Icon(
                                      _obscureConfirm
                                          ? Icons.visibility_off
                                          : Icons.visibility,
                                      color: colorOutline,
                                    ),
                                    onPressed: () {
                                      setState(() {
                                        _obscureConfirm = !_obscureConfirm;
                                      });
                                    },
                                  ),
                                  filled: true,
                                  fillColor: colorLowestSurface.withOpacity(0.05),
                                  contentPadding: const EdgeInsets.symmetric(
                                    vertical: 18,
                                    horizontal: 16,
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: BorderSide(
                                      color: Colors.grey[300]!,
                                    ),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: const BorderSide(
                                      color: colorPrimaryContainer,
                                      width: 1.5,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 32),
                            Container(
                              width: double.infinity,
                              height: 56,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(12),
                                gradient: const LinearGradient(
                                  colors: [
                                    Color(0xFF00E5FF),
                                    Color(0xFF00A694),
                                  ],
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: const Color(0xFF00E5FF).withOpacity(0.2),
                                    blurRadius: 20,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.transparent,
                                  shadowColor: Colors.transparent,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                onPressed: _isLoading ? null : _changePassword,
                                child: _isLoading
                                    ? const SizedBox(
                                        width: 24,
                                        height: 24,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2.5,
                                          color: Color(0xFF001F24),
                                        ),
                                      )
                                    : Row(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Text(
                                            'Update Password',
                                            style: GoogleFonts.montserrat(
                                              fontSize: 16,
                                              fontWeight: FontWeight.w700,
                                              color: const Color(0xFF001F24),
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          const Icon(
                                            Icons.check_circle_rounded,
                                            color: Color(0xFF001F24),
                                          ),
                                        ],
                                      ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}