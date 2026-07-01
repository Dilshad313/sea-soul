import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:seasoul/otp.dart';

class login extends StatefulWidget {
  const login({super.key});

  @override
  State<login> createState() => _loginState();
}

class _loginState extends State<login> {
  final _identifierController = TextEditingController();
  final _passwordController = TextEditingController();
  final FocusNode _identifierFocus = FocusNode();
  final FocusNode _passwordFocus = FocusNode();

  bool _isIdentifierFocused = false;
  bool _isPasswordFocused = false;
  bool _isLoading = false;
  bool _isSuccess = false;

  @override
  void initState() {
    super.initState();
    _identifierFocus.addListener(() {
      setState(() => _isIdentifierFocused = _identifierFocus.hasFocus);
    });
    _passwordFocus.addListener(() {
      setState(() => _isPasswordFocused = _passwordFocus.hasFocus);
    });
  }

  @override
  void dispose() {
    _identifierController.dispose();
    _passwordController.dispose();
    _identifierFocus.dispose();
    _passwordFocus.dispose();
    super.dispose();
  }

  void _handleLogin() async {
    if (_isLoading) return;
    setState(() {
      _isLoading = true;
      _isSuccess = false;
    });

    await Future.delayed(const Duration(milliseconds: 1500));

    setState(() {
      _isLoading = false;
      _isSuccess = true;
    });

    await Future.delayed(const Duration(milliseconds: 500));
    if (mounted) {
      setState(() => _isSuccess = false);
      Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => const otp()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    const colorBackground = Color(0xFF0D1516);
    const colorPrimaryContainer = Color(0xFF00E5FF);
    const colorSecondary = Color(0xFF59DBC7);
    const colorOnSurface = Color(0xFFDCE4E5);
    const colorOnSurfaceVariant = Color(0xFFBAC9CC);
    const colorOutline = Color(0xFF849396);
    const colorOutlineVariant = Color(0xFF3B494C);
    const colorLowestSurface = Color(0xFF080F11);

    return Scaffold(
      backgroundColor: colorBackground,
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

          Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(
                horizontal: 20.0,
                vertical: 48.0,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'SeaSoul',
                    style: GoogleFonts.montserrat(
                      fontSize: 36,
                      fontWeight: FontWeight.w700,
                      color: colorPrimaryContainer,
                      letterSpacing: -0.02,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'LUXURIOUS ISLAND GETAWAYS',
                    style: GoogleFonts.montserrat(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: colorOutline,
                      letterSpacing: 2.4,
                    ),
                  ),
                  const SizedBox(height: 40),

                  // Central Glassmorphic Form Wrapper Card
                  AnimatedScale(
                    scale: (_isIdentifierFocused || _isPasswordFocused)
                        ? 1.01
                        : 1.0,
                    duration: const Duration(milliseconds: 200),
                    curve: Curves.easeOutCubic,
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(24),
                      child: BackdropFilter(
                        filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
                        child: Container(
                          width: double.infinity,
                          constraints: const BoxConstraints(maxWidth: 440),
                          padding: const EdgeInsets.all(32.0),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.05),
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(
                              color: Colors.white.withOpacity(0.1),
                              width: 1,
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Welcome Back',
                                style: GoogleFonts.montserrat(
                                  fontSize: 24,
                                  fontWeight: FontWeight.w600,
                                  color: colorOnSurface,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Please enter your details to continue your journey.',
                                style: GoogleFonts.montserrat(
                                  fontSize: 14,
                                  color: colorOnSurfaceVariant,
                                ),
                              ),
                              const SizedBox(height: 32),

                              _buildFormLabel('Email or Phone', colorOutline),
                              const SizedBox(height: 8),
                              _buildInputField(
                                controller: _identifierController,
                                focusNode: _identifierFocus,
                                hintText: 'marina@example.com',
                                icon: Icons.person_outline,
                                isFocused: _isIdentifierFocused,
                                lowestBg: colorLowestSurface,
                                activeTint: colorPrimaryContainer,
                              ),
                              const SizedBox(height: 24),

                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  _buildFormLabel('Password', colorOutline),
                                  GestureDetector(
                                    onTap: () {},
                                    child: Text(
                                      'Forgot Password?',
                                      style: GoogleFonts.montserrat(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w500,
                                        color: colorPrimaryContainer,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              _buildInputField(
                                controller: _passwordController,
                                focusNode: _passwordFocus,
                                hintText: '••••••••',
                                icon: Icons.lock_outline,
                                isFocused: _isPasswordFocused,
                                obscureText: true,
                                lowestBg: colorLowestSurface,
                                activeTint: colorPrimaryContainer,
                              ),
                              const SizedBox(height: 32),

                              _buildSubmitButton(
                                colorPrimaryContainer,
                                colorSecondary,
                              ),
                              const SizedBox(height: 32),

                              Row(
                                children: [
                                  Expanded(
                                    child: Divider(
                                      color: colorOutlineVariant.withOpacity(
                                        0.5,
                                      ),
                                    ),
                                  ),
                                  Padding(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 16.0,
                                    ),
                                    child: Text(
                                      'OR CONTINUE WITH',
                                      style: GoogleFonts.montserrat(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w700,
                                        color: colorOutline,
                                        letterSpacing: 1.0,
                                      ),
                                    ),
                                  ),
                                  Expanded(
                                    child: Divider(
                                      color: colorOutlineVariant.withOpacity(
                                        0.5,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 32),

                              Row(
                                children: [
                                  Expanded(
                                    child: _buildSocialButton(
                                      text: 'Google',
                                      borderColor: colorOutlineVariant,
                                      child: Image.network(
                                        'https://lh3.googleusercontent.com/aida-public/AB6AXuAOta294P336wxTwzddMVlIH1_Phq3nTNUDNgsDEk6lISqz6YhPGCp9bVRZNMjosjS-V3IfpeYunBHZ-5KAwvZzDDaH-aDEYM2KOyexjsaWxoyCX1XWJ_jJ8WRfMOoZiCLNtFnYKhYuG7cLSr6WVQ6yEPe6JIwaxcgkTqJHs80GpOdAP-P35v6bN_NIoiKRwCD6iDA4lZ9MdaqgRaEi3Kz6iMLLv4wG9gDq7UYJ0wjiIA7YaoIZsuJqjNjbYTQuI5ack3_KBMQQZTM',
                                        width: 20,
                                        height: 20,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: _buildSocialButton(
                                      text: 'Apple',
                                      borderColor: colorOutlineVariant,
                                      child: const Icon(
                                        Icons.apps,
                                        size: 20,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 32),

                              Center(
                                child: RichText(
                                  text: TextSpan(
                                    style: GoogleFonts.montserrat(
                                      fontSize: 14,
                                      color: colorOnSurfaceVariant,
                                    ),
                                    children: [
                                       TextSpan(text: 'New to SeaSoul? '),
                                      TextSpan(
                                        text: 'Register',
                                        style: const TextStyle(
                                          color: colorPrimaryContainer,
                                          fontWeight: FontWeight.w600,
                                          decoration: TextDecoration.underline,
                                        ),
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
                  ),

                  const SizedBox(height: 48),
                  Container(
                    constraints: const BoxConstraints(maxWidth: 960),
                    child: LayoutBuilder(
                      builder: (context, constraints) {
                        if (constraints.maxWidth < 600)
                          return const SizedBox.shrink();
                        return Row(
                          children: [
                            Expanded(
                              child: _buildFooterImageCard(
                                'https://lh3.googleusercontent.com/aida-public/AB6AXuCGj63d9p8qo_Tv3HPaUmsgiC_LDQ_T2VPjhCWvchdhhIzGDALQ4fB6qbeJb1ptgy4jcOGdDfJZOG7oPqZPg5E73kt3AKRfnls9gvqIRmGi_-M6kwRfv9wKLfBr0kbJLcP8KIKtuPpPQmM8H8FDGT2BBaZ7qb_Ee3ju8mIKUdlKb-0RVlD3rutPwaoIrNf2ruoKaZlLz4z-JTb0oeC-uLpjuL7xhjn9ShmMmJZGY8A-LThk-XCyzRLD2M2jEXDK20JFIsXzQ48aV-4',
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: _buildFooterImageCard(
                                'https://lh3.googleusercontent.com/aida-public/AB6AXuAumpLrAwm0xReKTRBe2o-QCM2r79e8mkp2FF9X66NxdJWMPo2g3sfxKF4BqJBBUrc-fYB2OTaxqez_ro4F3_e28Hmje7Vww-fhHUaJlK2s2zD5aUDiW56DEHgnfUkYYqFrjXK7ArWFX8i9zb7EnCk0WCixLxIwEy4hsq1e0-tMeHpooHqZOJHr4Bt4L-A4z5-VqsellPw0XW4g-6g1YA2aH6oEYfQBVx6cIKRv8revvI_zVEHCY8TVzndVvaSZIh-2yIkKCaTTZNg',
                              ),
                            ),
                          ],
                        );
                      },
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

  Widget _buildFormLabel(String label, Color color) {
    return Text(
      label.toUpperCase(),
      style: GoogleFonts.montserrat(
        fontSize: 12,
        fontWeight: FontWeight.w700,
        color: color,
        letterSpacing: 1.0,
      ),
    );
  }

  Widget _buildInputField({
    required TextEditingController controller,
    required FocusNode focusNode,
    required String hintText,
    required IconData icon,
    required bool isFocused,
    required Color lowestBg,
    required Color activeTint,
    bool obscureText = false,
  }) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        boxShadow: isFocused
            ? [BoxShadow(color: activeTint.withOpacity(0.15), blurRadius: 15)]
            : null,
      ),
      child: TextField(
        controller: controller,
        focusNode: focusNode,
        obscureText: obscureText,
        style: GoogleFonts.montserrat(color: Colors.white, fontSize: 16),
        decoration: InputDecoration(
          hintText: hintText,
          hintStyle: GoogleFonts.montserrat(
            color: Colors.white24,
            fontSize: 16,
          ),
          prefixIcon: Icon(
            icon,
            color: isFocused ? activeTint : const Color(0xFF849396),
          ),
          filled: true,
          fillColor: lowestBg,
          contentPadding: const EdgeInsets.symmetric(
            vertical: 18,
            horizontal: 16,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: activeTint, width: 1.5),
          ),
        ),
      ),
    );
  }

  Widget _buildSubmitButton(Color fromGradient, Color toGradient) {
    return Container(
      width: double.infinity,
      height: 58,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(99),
        gradient: LinearGradient(
          colors: [fromGradient, toGradient],
        ),
        boxShadow: [
          BoxShadow(
            color: fromGradient.withOpacity(0.15),
            blurRadius: 40,
            offset: const Offset(0, 20),
          ),
        ],
      ),
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          shadowColor: Colors.transparent,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(99),
          ),
        ),
        onPressed: _handleLogin,
        child: _isLoading
            ? Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.5,
                      color: Colors.white54,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    'Authenticating...',
                    style: TextStyle(
                      color: Colors.white54,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              )
            : Text(
                _isSuccess ? 'Success!' : 'Login',
                style: GoogleFonts.montserrat(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
      ),
    );
  }

  Widget _buildSocialButton({
    required String text,
    required Color borderColor,
    required Widget child,
  }) {
    return Container(
      height: 48,
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.02),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: borderColor.withOpacity(0.3)),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () {},
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            child,
            const SizedBox(width: 8),
            Text(
              text,
              style: GoogleFonts.montserrat(color: Colors.white, fontSize: 14),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFooterImageCard(String url) {
    return Container(
      height: 128,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        image: DecorationImage(image: NetworkImage(url), fit: BoxFit.cover),
      ),
    );
  }
}