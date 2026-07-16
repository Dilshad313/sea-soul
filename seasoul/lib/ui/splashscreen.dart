import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:seasoul/ui/signup.dart';
import 'package:seasoul/ui/user_home.dart';
import '../services/api_service.dart';


class splashscreen extends StatelessWidget {
  const splashscreen({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SeaSoul Holidays',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        fontFamily: 'PlusJakartaSans',
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0099CC),
          primary: const Color(0xFF0099CC),
        ),
      ),
      home:  SplashScreen(),
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  late AnimationController _fadeController;
  late AnimationController _pulseController;
  late AnimationController _loadingController;

  late Animation<double> _revealAnimation;
  late Animation<double> _pulseAnimation;

  double _mouseX = 0.0;
  double _mouseY = 0.0;

  static const Color deepNavy = Color.fromARGB(255, 3, 28, 48);
  static const Color oceanBlue = Color(0xFF0099CC);

  @override
  void initState() {
    super.initState();

    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );
    _revealAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _fadeController, curve: Curves.easeOutCubic),
    );

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat(reverse: true);
    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.02).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _loadingController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    );

    _fadeController.forward();
    _loadingController.forward();

    _checkLoginStatus();
  }

  Future<void> _checkLoginStatus() async {
    // Wait for splash screen animation
    await Future.delayed(const Duration(milliseconds: 2000));

    // Check if user is logged in
    final isLoggedIn = await ApiService.isLoggedIn();
    
    if (mounted) {
      if (isLoggedIn) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const UserHome()),
        );
      } else {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) =>  SignupPage()),
        );
      }
    }
  }

  @override
  void dispose() {
    _fadeController.dispose();
    _pulseController.dispose();
    _loadingController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: deepNavy,
      body: MouseRegion(
        onHover: (event) {
          setState(() {
            _mouseX =
                (event.localPosition.dx / MediaQuery.of(context).size.width -
                    0.5) *
                15;
            _mouseY =
                (event.localPosition.dy / MediaQuery.of(context).size.height -
                    0.5) *
                15;
          });
        },
        child: Stack(
          children: [
            AnimatedPositioned(
              duration: const Duration(milliseconds: 100),
              curve: Curves.easeOut,
              top: -20 + _mouseY,
              left: -20 + _mouseX,
              right: -20 - _mouseX,
              bottom: -20 - _mouseY,
              child: Container(
                decoration: const BoxDecoration(
                  image: DecorationImage(
                    image: NetworkImage(
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuB7ydCWif8dA2MQWoV4Dj5372iXu-BpFFAINz89b7qg_x9mK4PKO7Pza3U5ykJB_hm5lNDxIoKWkXm8lCMJ2fLkMgTdkC-tZCgcT3Vd03IuadaqxE7J_Uhyxej2avP32TlJzGaxv4v8VOpH7O_ad4G4PBjEI6W_f81caZMnX7PRcp5vJZ25bsTzLl8hFx1P4cuvKXb4MtlG5oLWYc-GR9e0H56ItJvSgX8ekmaCRwQVTGt5exudRe3V3oQxclTT9vD65tgQyVqFjv0',
                    ),
                    fit: BoxFit.cover,
                  ),
                ),
              ),
            ),
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  gradient: RadialGradient(
                    center: Alignment.center,
                    radius: 1.2,
                    colors: [
                      deepNavy.withOpacity(0.2),
                      deepNavy.withOpacity(0.6),
                    ],
                  ),
                ),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 2.0, sigmaY: 2.0),
                  child: Container(color: Colors.transparent),
                ),
              ),
            ),
            SafeArea(
              child: Center(
                child: FadeTransition(
                  opacity: _revealAnimation,
                  child: AnimatedBuilder(
                    animation: _revealAnimation,
                    builder: (context, child) {
                      return Transform.translate(
                        offset: Offset(0, 20 * (1.0 - _revealAnimation.value)),
                        child: child,
                      );
                    },
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const SizedBox(height: 1),
                        Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              height: 100,
                              width: 100,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(80),
                                image: const DecorationImage(
                                  image: AssetImage('assets/images/image.png'),
                                  fit: BoxFit.contain,
                                ),
                              ),
                            ),
                            ScaleTransition(
                              scale: _pulseAnimation,
                              child: Text(
                                'SeaSoul',
                                style: TextStyle(
                                  fontSize:
                                      MediaQuery.of(context).size.width > 600
                                      ? 48
                                      : 32,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                  letterSpacing: -0.5,
                                  shadows: [
                                    Shadow(
                                      color: Colors.white.withOpacity(0.6),
                                      blurRadius: 20,
                                    ),
                                    Shadow(
                                      color: oceanBlue.withOpacity(0.3),
                                      blurRadius: 40,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(height: 8),
                            Container(
                              height: 1,
                              width: 48,
                              color: Colors.white.withOpacity(0.4),
                            ),
                            const SizedBox(height: 16),
                            const Text(
                              'HOLIDAYS',
                              style: TextStyle(
                                fontFamily: 'Inter',
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: Colors.white70,
                                letterSpacing: 4.2,
                              ),
                            ),
                            const SizedBox(height: 48),
                            Container(
                              width: 192,
                              height: 2,
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(999),
                              ),
                              child: AnimatedBuilder(
                                animation: _loadingController,
                                builder: (context, child) {
                                  return FractionallySizedBox(
                                    alignment: Alignment.centerLeft,
                                    widthFactor: _loadingController.value,
                                    child: Container(
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(
                                          999,
                                        ),
                                        gradient: const LinearGradient(
                                          colors: [
                                            Colors.transparent,
                                            oceanBlue,
                                            Colors.transparent,
                                          ],
                                        ),
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),
                          ],
                        ),
                        Padding(
                          padding: const EdgeInsets.only(bottom: 18.0),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                'POWERED BY SEASOUL',
                                style: TextStyle(
                                  fontFamily: 'Inter',
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                  color: Colors.white.withOpacity(0.6),
                                  letterSpacing: 2.0,
                                ),
                              ),
                              const SizedBox(height: 16),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Container(
                                    width: 4,
                                    height: 4,
                                    decoration: const BoxDecoration(
                                      color: oceanBlue,
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                  const SizedBox(width: 4),
                                  Container(
                                    width: 4,
                                    height: 4,
                                    decoration: BoxDecoration(
                                      color: Colors.white.withOpacity(0.2),
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                  const SizedBox(width: 4),
                                  Container(
                                    width: 4,
                                    height: 4,
                                    decoration: BoxDecoration(
                                      color: Colors.white.withOpacity(0.2),
                                      shape: BoxShape.circle,
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
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}