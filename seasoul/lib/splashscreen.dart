// import 'dart:math' as math;
// import 'package:flutter/material.dart';
// import 'package:google_fonts/google_fonts.dart';
// import 'dart:ui';

// import 'package:seasoul/signup.dart';

// class LoginPage extends StatelessWidget {
//   const LoginPage({super.key});

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       backgroundColor: const Color(0xFF0D1516),
//       body: Center(
//         child: Column(
//           mainAxisAlignment: MainAxisAlignment.center,
//           children: [
//             const Text(
//               'Login Page',
//               style: TextStyle(
//                 color: Colors.white,
//                 fontSize: 32,
//                 fontWeight: FontWeight.bold,
//               ),
//             ),
//             const SizedBox(height: 20),
//             ElevatedButton(
//               onPressed: () {
//                 Navigator.pushReplacement(
//                   context,
//                   MaterialPageRoute(builder: (context) => const splashscreen()),
//                 );
//               },
//               child: const Text('Back to Splash'),
//             ),
//           ],
//         ),
//       ),
//     );
//   }
// }

// class splashscreen extends StatefulWidget {
//   const splashscreen({super.key});

//   @override
//   State<splashscreen> createState() => _splashscreenState();
// }

// class _splashscreenState extends State<splashscreen>
//     with TickerProviderStateMixin {
//   late AnimationController _bgScaleController;
//   late AnimationController _contentFadeController;
//   late AnimationController _spinnerController;

//   @override
//   void initState() {
//     super.initState();

//     _bgScaleController = AnimationController(
//       duration: const Duration(seconds: 20),
//       vsync: this,
//     )..repeat(reverse: true);

//     _contentFadeController = AnimationController(
//       duration: const Duration(milliseconds: 1200),
//       vsync: this,
//     );

//     _spinnerController = AnimationController(
//       duration: const Duration(seconds: 1),
//       vsync: this,
//     )..repeat();

//     _contentFadeController.forward();

//     _navigateToLogin();
//   }

//   void _navigateToLogin() {
//     WidgetsBinding.instance.addPostFrameCallback((_) {
//       Future.delayed(const Duration(seconds: 3), () {
//         if (mounted) {
//           try {
//             Navigator.pushReplacement(
//               context,
//               MaterialPageRoute(builder: (context) => const signup()),
//             );
//           } catch (e) {
//             print('Navigation error: $e');
//           }
//         }
//       });
//     });
//   }

//   @override
//   void dispose() {
//     _bgScaleController.dispose();
//     _contentFadeController.dispose();
//     _spinnerController.dispose();
//     super.dispose();
//   }

//   @override
//   Widget build(BuildContext context) {
//     const colorBackground = Color(0xFF0D1516);
//     const colorPrimary = Color(0xFFC3F5FF);
//     const colorPrimaryContainer = Color(0xFF00E5FF);
//     const colorOnSurfaceVariant = Color(0xFFBAC9CC);

//     return Scaffold(
//       backgroundColor: colorBackground,
//       body: Stack(
//         alignment: Alignment.center,
//         children: [
//           AnimatedBuilder(
//             animation: _bgScaleController,
//             builder: (context, child) {
//               return Transform.scale(
//                 scale: 1.0 + (_bgScaleController.value * 0.1),
//                 child: child,
//               );
//             },
//             child: Container(
//               decoration: const BoxDecoration(
//                 image: DecorationImage(
//                   image: NetworkImage(
//                     'https://lh3.googleusercontent.com/aida-public/AB6AXuCt-DSCSueGO2_yPOhKG-YU6gcjxtktZSeOuuUqRLkcCmNsg6j-Qk1y00WVzb173-EcPZ1yTQicfvXlntKjPiCnqIUH0W0_MpqNYuPftjSWcEVW25JR_gJ7-gILSbxAG32evip-MSxyl1s6ETX7D2HhiOZseuhDNqncsG9V49RpAH2oqutJ5gurMxB1C8SmM-6OmFPTkBJwj5UP0yt6Mtz6VSSUMSl5p-TW2DRVW-ieFuzVZayJ6M7FsC67rg0dEjr8HYbTM1PzvWw',
//                   ),
//                   fit: BoxFit.cover,
//                 ),
//               ),
//             ),
//           ),
//           Container(color: Colors.black.withOpacity(0.4)),

//           SafeArea(
//             child: Padding(
//               padding: const EdgeInsets.all(20.0),
//               child: Column(
//                 mainAxisAlignment: MainAxisAlignment.center,
//                 children: [
//                   AnimatedBuilder(
//                     animation: _contentFadeController,
//                     builder: (context, child) {
//                       final slideUp = Tween<double>(begin: 20.0, end: 0.0)
//                           .animate(
//                             CurvedAnimation(
//                               parent: _contentFadeController,
//                               curve: const Interval(
//                                 0.2,
//                                 1.0,
//                                 curve: Curves.linearToEaseOut,
//                               ),
//                             ),
//                           );

//                       return Opacity(
//                         opacity: _contentFadeController.value,
//                         child: Transform.translate(
//                           offset: Offset(0, slideUp.value),
//                           child: child,
//                         ),
//                       );
//                     },
//                     child: _buildGlassPanel(colorPrimary),
//                   ),
//                 ],
//               ),
//             ),
//           ),

//           Positioned(
//             bottom: 48,
//             left: 0,
//             right: 0,
//             child: AnimatedBuilder(
//               animation: _contentFadeController,
//               builder: (context, child) {
//                 final footerOpacity = Tween<double>(begin: 0.0, end: 1.0)
//                     .animate(
//                       CurvedAnimation(
//                         parent: _contentFadeController,
//                         curve: const Interval(0.6, 1.0, curve: Curves.easeIn),
//                       ),
//                     );
//                 return Opacity(opacity: footerOpacity.value, child: child);
//               },
//               child: Column(
//                 mainAxisSize: MainAxisSize.min,
//                 children: [
//                   Stack(
//                     alignment: Alignment.center,
//                     children: [
//                       RotationTransition(
//                         turns: _spinnerController,
//                         child: Container(
//                           width: 48,
//                           height: 48,
//                           decoration: BoxDecoration(
//                             shape: BoxShape.circle,
//                             border: Border.all(
//                               color: colorPrimaryContainer.withOpacity(0.1),
//                               width: 2,
//                             ),
//                           ),
//                         ),
//                       ),
//                       Container(
//                         width: 8,
//                         height: 8,
//                         decoration: const BoxDecoration(
//                           color: colorPrimaryContainer,
//                           shape: BoxShape.circle,
//                           boxShadow: [
//                             BoxShadow(
//                               color: colorPrimaryContainer,
//                               blurRadius: 10,
//                               spreadRadius: 2,
//                             ),
//                           ],
//                         ),
//                       ),
//                     ],
//                   ),
//                   const SizedBox(height: 32),
//                   Text(
//                     'POWERED BY',
//                     style: GoogleFonts.montserrat(
//                       fontSize: 12,
//                       fontWeight: FontWeight.w700,
//                       color: colorOnSurfaceVariant.withOpacity(0.6),
//                       letterSpacing: 2.0,
//                     ),
//                   ),
//                   const SizedBox(height: 4),
//                   Text(
//                     'SeaSoul',
//                     style: GoogleFonts.montserrat(
//                       fontSize: 20,
//                       fontWeight: FontWeight.w700,
//                       color: Colors.white,
//                     ),
//                   ),
//                 ],
//               ),
//             ),
//           ),
//         ],
//       ),
//     );
//   }

//   Widget _buildGlassPanel(Color colorPrimary) {
//     return ClipRRect(
//       borderRadius: BorderRadius.circular(12),
//       child: BackdropFilter(
//         filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
//         child: Container(
//           width: double.infinity,
//           padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 40),
//           decoration: BoxDecoration(
//             color: Colors.white.withOpacity(0.03),
//             borderRadius: BorderRadius.circular(12),
//             border: Border.all(color: Colors.white.withOpacity(0.1), width: 1),
//           ),
//           child: Column(
//             mainAxisSize: MainAxisSize.min,
//             children: [
//               Container(
//                 width: 140,
//                 height: 140,
//                 decoration: BoxDecoration(
//                   color: Colors.transparent,
//                   boxShadow: [
//                     BoxShadow(
//                       color: const Color(0xFF00E5FF).withOpacity(0.3),
//                       blurRadius: 15,
//                       spreadRadius: 2,
//                     ),
//                   ],
//                 ),
//                 child: Image.network(
//                   'https://lh3.googleusercontent.com/aida/AP1WRLvZOduoRJzZOniJtveIR1NB_edHaJ1zg0fGJ1-RZndCm7a7fSPI0VrCJ_r0N7Upokhai4wbQy1MSk6wEgh-HhfyJnzUQe6bV1nsVcSdU5rDcJwLpyIqiuWtyHGnHaWyIhUbZVCnL3-L5jea3XlLwSjVI93HI8oGCaz6QeOnzUufShifgyDzWsB5mPwEoS_29F4MwrR1ca-O4wu6Fmgq9SgnNdtcMd2cWAIAUl7flD3svKk8bKE7WDpk0vw',
//                   fit: BoxFit.contain,
//                 ),
//               ),
//               const SizedBox(height: 24),
//               Text(
//                 'SeaSoul Holidays',
//                 textAlign: TextAlign.center,
//                 style: GoogleFonts.montserrat(
//                   fontSize: 36,
//                   fontWeight: FontWeight.w700,
//                   color: Colors.white,
//                   letterSpacing: -0.5,
//                 ),
//               ),
//               const SizedBox(height: 8),
//               Text(
//                 'LUXURIOUS ISLAND ESCAPES',
//                 textAlign: TextAlign.center,
//                 style: GoogleFonts.montserrat(
//                   fontSize: 16,
//                   fontWeight: FontWeight.w500,
//                   color: colorPrimary.withOpacity(0.8),
//                   letterSpacing: 1.5,
//                 ),
//               ),
//             ],
//           ),
//         ),
//       ),
//     );
//   }
// }

// extension on BoxDecoration {
//   Gradient? get borderGradient => null;
// }

import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:seasoul/login.dart';
import 'package:seasoul/signup.dart';

void main() {
  runApp(const splashscreen());
}

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
      home: const SplashScreen(),
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
      duration: const Duration(milliseconds: 3000),
    );

    _fadeController.forward();
    _loadingController.forward();

    Timer(const Duration(milliseconds: 3000), () {
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const signup()),
        );
      }
    });
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
