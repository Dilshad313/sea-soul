import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:seasoul/ui/signup.dart';
import 'package:seasoul/ui/user_home.dart';
import '../services/api_service.dart';
import '../constants/api_constants.dart';

class OTPPage extends StatefulWidget {
  final String email;
  final String fullName;
  final String phone;
  final String password;

  const OTPPage({
    super.key,
    required this.email,
    required this.fullName,
    required this.phone,
    required this.password,
  });

  @override
  State<OTPPage> createState() => _OTPPageState();
}

class _OTPPageState extends State<OTPPage> {
  final int _otpLength = 4;
  late List<FocusNode> _focusNodes;
  late List<TextEditingController> _controllers;

  Timer? _countdownTimer;
  int _secondsLeft = 59;
  bool _canResend = false;
  bool _isLoading = false;
  bool _isVerifying = false;
  String _errorMessage = '';

  @override
  void initState() {
    super.initState();
    _focusNodes = List.generate(_otpLength, (index) => FocusNode());
    _controllers = List.generate(
      _otpLength,
      (index) => TextEditingController(),
    );
    _startTimer();
    _sendInitialOTP();
  }

  void _startTimer() {
    setState(() {
      _secondsLeft = 59;
      _canResend = false;
    });
    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsLeft == 0) {
        setState(() {
          _countdownTimer?.cancel();
          _canResend = true;
        });
      } else {
        setState(() {
          _secondsLeft--;
        });
      }
    });
  }

  Future<void> _sendInitialOTP() async {
    try {
      print('📤 Sending initial OTP to: ${widget.email}');
      final response = await ApiService.post(ApiConstants.sendOTP, {
        'email': widget.email,
      });
      print('📥 Initial OTP Response: $response');
      
      if (response['success'] == true) {
        print('✅ OTP sent successfully');
      } else {
        print('⚠️ OTP send failed: ${response['message']}');
        // Try alternative endpoint
        try {
          final altResponse = await ApiService.post(ApiConstants.resendOTP, {
            'email': widget.email,
          });
          if (altResponse['success'] == true) {
            print('✅ OTP sent via alternative endpoint');
          }
        } catch (e) {
          print('⚠️ Alternative OTP send failed: $e');
        }
      }
    } catch (e) {
      print('⚠️ Initial OTP send error: $e');
      // Don't show error to user as they might have already received OTP
    }
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    for (var node in _focusNodes) {
      node.dispose();
    }
    for (var controller in _controllers) {
      controller.dispose();
    }
    super.dispose();
  }

  void _verifyOTP() async {
    if (_isLoading || _isVerifying) return;

    setState(() {
      _errorMessage = '';
    });

    String otp = '';
    for (var controller in _controllers) {
      otp += controller.text;
    }

    if (otp.length != _otpLength) {
      setState(() {
        _errorMessage = 'Please enter complete OTP';
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter complete OTP'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    setState(() => _isVerifying = true);

    try {
      final data = {
        'email': widget.email,
        'otp': otp,
      };

      print('📤 Verifying OTP for email: ${widget.email}');
      print('📤 OTP: $otp');
      
      final verifyResponse = await ApiService.post(ApiConstants.verifyOTP, data);
      print('📥 Verify Response: $verifyResponse');

      if (verifyResponse['success'] == true && verifyResponse['verified'] == true) {
        print('✅ OTP Verified! Registering user...');

        final registerData = {
          'fullName': widget.fullName,
          'email': widget.email,
          'phone': widget.phone,
          'password': widget.password,
        };

        print('📤 Registering user: $registerData');
        final registerResponse = await ApiService.post(ApiConstants.register, registerData);
        print('📥 Register Response: $registerResponse');

        if (registerResponse['success'] == true || registerResponse['token'] != null) {
          // Save token and user data
          if (registerResponse['token'] != null) {
            await ApiService.saveToken(registerResponse['token']);
          }
          
          await ApiService.saveUserData({
            '_id': registerResponse['_id'] ?? registerResponse['user']?['_id'],
            'fullName': registerResponse['fullName'] ?? registerResponse['user']?['fullName'] ?? widget.fullName,
            'email': registerResponse['email'] ?? registerResponse['user']?['email'] ?? widget.email,
            'phone': registerResponse['phone'] ?? registerResponse['user']?['phone'] ?? widget.phone,
          });
          
          print('✅ Token and user data saved!');

          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('✅ Registration successful! Welcome to SeaSoul!'),
                backgroundColor: Colors.green,
                duration: Duration(seconds: 2),
              ),
            );

            await Future.delayed(const Duration(milliseconds: 500));
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (context) => const UserHome()),
            );
          }
        } else {
          throw Exception(registerResponse['message'] ?? 'Registration failed');
        }
      } else {
        throw Exception(verifyResponse['message'] ?? 'OTP verification failed');
      }
    } catch (e) {
      print('❌ Error: $e');
      
      String errorMessage = e.toString().replaceAll('Exception: ', '');
      
      // Handle specific error types
      if (errorMessage.toLowerCase().contains('expired')) {
        errorMessage = 'OTP has expired. Please request a new one.';
        _resendOTP(); // Auto resend
      } else if (errorMessage.toLowerCase().contains('invalid')) {
        errorMessage = 'Invalid OTP. Please check and try again.';
        // Clear all fields
        for (var controller in _controllers) {
          controller.clear();
        }
        _focusNodes[0].requestFocus();
      } else if (errorMessage.toLowerCase().contains('already verified')) {
        errorMessage = 'Email already verified. Please login.';
        // Navigate to login
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const signup()),
        );
        return;
      }
      
      setState(() {
        _errorMessage = errorMessage;
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMessage),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isVerifying = false);
    }
  }

  void _resendOTP() async {
    if (!_canResend || _isLoading) return;

    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      final data = {'email': widget.email};
      
      print('📤 Resending OTP to: ${widget.email}');
      
      // Try multiple possible endpoints
      bool success = false;
      String errorMessage = 'Failed to resend OTP';
      
      // List of endpoints to try in order
      List<Map<String, dynamic>> endpoints = [
        {'url': ApiConstants.resendOTP, 'name': 'resendOTP'},
        {'url': ApiConstants.sendOTP, 'name': 'sendOTP'},
        {'url': '${ApiConstants.baseUrl}/api/auth/resend-otp', 'name': 'resend-otp-alt'},
        {'url': '${ApiConstants.baseUrl}/api/auth/send-otp', 'name': 'send-otp-alt'},
      ];
      
      for (var endpoint in endpoints) {
        try {
          print('📤 Trying endpoint: ${endpoint['name']} - ${endpoint['url']}');
          final response = await ApiService.post(endpoint['url'], data);
          print('📥 Response from ${endpoint['name']}: $response');
          
          if (response['success'] == true) {
            success = true;
            print('✅ OTP resent successfully via ${endpoint['name']}');
            break;
          }
        } catch (e) {
          print('⚠️ Endpoint ${endpoint['name']} failed: $e');
          // Continue to next endpoint
        }
      }
      
      if (success) {
        // Clear all OTP fields
        for (var controller in _controllers) {
          controller.clear();
        }
        _focusNodes[0].requestFocus();
        _startTimer();
        
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('✅ OTP resent successfully! Please check your email.'),
              backgroundColor: Colors.green,
              duration: Duration(seconds: 3),
            ),
          );
        }
      } else {
        // Try one more time with a different approach - using GET request
        try {
          print('📤 Trying GET request for resend...');
          final response = await ApiService.get('${ApiConstants.baseUrl}/api/auth/resend-otp?email=${widget.email}');
          print('📥 GET Response: $response');
          if (response['success'] == true) {
            success = true;
          }
        } catch (e) {
          print('⚠️ GET request failed: $e');
        }
        
        if (success) {
          for (var controller in _controllers) {
            controller.clear();
          }
          _focusNodes[0].requestFocus();
          _startTimer();
          
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('✅ OTP resent successfully!'),
                backgroundColor: Colors.green,
              ),
            );
          }
        } else {
          throw Exception('Unable to resend OTP. Please try again later.');
        }
      }
    } catch (e) {
      print('❌ Resend OTP Error: $e');
      
      String errorMessage = e.toString().replaceAll('Exception: ', '');
      setState(() {
        _errorMessage = errorMessage;
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('⚠️ $errorMessage'),
            backgroundColor: Colors.orange,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _handleOtpChange(String value, int index) {
    setState(() {
      _errorMessage = '';
    });
    
    if (value.isNotEmpty) {
      if (index < _otpLength - 1) {
        _focusNodes[index + 1].requestFocus();
      } else {
        _focusNodes[index].unfocus();
        // Auto-verify when last digit is entered
        if (_controllers.every((c) => c.text.isNotEmpty)) {
          _verifyOTP();
        }
      }
    } else {
      if (index > 0) {
        _focusNodes[index - 1].requestFocus();
      }
    }
  }

  void _goBackToSignup() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (context) => const signup(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    const colorBackground = Color(0xFF0D1516);
    const colorPrimaryContainer = Color(0xFF00E5FF);
    const colorOnPrimaryFixed = Color(0xFF001F24);
    const colorOnSurface = Color(0xFFDCE4E5);
    const colorOnSurfaceVariant = Color(0xFFBAC9CC);
    const colorOutline = Color(0xFF849396);
    const colorError = Color(0xFFFF6B6B);

    return Scaffold(
      backgroundColor: colorBackground,
      body: Stack(
        alignment: Alignment.center,
        children: [
          Positioned.fill(child: Container(color: colorBackground)),
          Positioned.fill(
            child: Opacity(
              opacity: 0.2,
              child: Image.network(
                'https://lh3.googleusercontent.com/aida-public/AB6AXuAIx0yomZ86ZvhZIuGwPhZH7msLm2aTLXqAsTiLsIzfo5QugjjV-qQz2yT18iOP7ttYlZnO9MVO2YtMha3I7p0fQ-Z1QtkkWfAcxy_z1VFaiO25e4xkfHRwE4dwtlMNQeFKFc_CIXv9oveAVD5Zg3JOL078YrJHLxObFhswT5uY9731bEdq2CaOY_8vJ4Ll4tX0DTWpgqrYdxcYkIOqSJVOvTcOrcXq_ZpnRXdSSqDKxPeHUqbr4AL9HuNtHUCGwgfsrPKnzjfqgtk',
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Container(),
              ),
            ),
          ),
          Positioned(
            top: -200,
            right: -200,
            width: MediaQuery.of(context).size.width * 1.2,
            height: MediaQuery.of(context).size.width * 1.2,
            child: IgnorePointer(
              child: Container(
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      colorPrimaryContainer.withOpacity(0.15),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),
          ),
          Positioned(
            top: 35,
            left: 0,
            right: 0,
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 20.0,
                  vertical: 16.0,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(
                          Icons.location_on_outlined,
                          color: colorPrimaryContainer,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'SeaSoul',
                          style: GoogleFonts.montserrat(
                            fontSize: 20,
                            fontWeight: FontWeight.w600,
                            color: colorPrimaryContainer,
                          ),
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: colorOnSurface),
                      style: IconButton.styleFrom(
                        backgroundColor: Colors.white.withOpacity(0.05),
                        side: BorderSide(color: Colors.white.withOpacity(0.1)),
                      ),
                      onPressed: _goBackToSignup,
                    ),
                  ],
                ),
              ),
            ),
          ),
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: Container(
                constraints: const BoxConstraints(maxWidth: 440),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'Verify Email',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.montserrat(
                        fontSize: 24,
                        fontWeight: FontWeight.w600,
                        color: colorOnSurface,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Padding(
                      padding: const EdgeInsets.only(top: 100),
                      child: RichText(
                        textAlign: TextAlign.center,
                        text: TextSpan(
                          style: GoogleFonts.montserrat(
                            fontSize: 16,
                            color: colorOnSurfaceVariant,
                          ),
                          children: [
                            const TextSpan(text: "We've sent a code to "),
                            TextSpan(
                              text: widget.email,
                              style: const TextStyle(
                                color: Color(0xFFC3F5FF),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 48),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: List.generate(
                        _otpLength,
                        (index) => _buildOtpField(index, colorPrimaryContainer),
                      ),
                    ),
                    if (_errorMessage.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.red.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.red.withOpacity(0.3)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.error_outline, color: colorError, size: 20),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                _errorMessage,
                                style: GoogleFonts.montserrat(
                                  fontSize: 14,
                                  color: colorError,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(height: 32),
                    Column(
                      children: [
                        Text(
                          "Didn't receive the code?",
                          style: GoogleFonts.montserrat(
                            fontSize: 14,
                            color: colorOutline,
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextButton(
                          onPressed: _canResend && !_isLoading ? _resendOTP : null,
                          child: Text(
                            _isLoading
                                ? 'Sending...'
                                : _canResend
                                    ? 'Resend Code'
                                    : 'Resend in 00:${_secondsLeft.toString().padLeft(2, '0')}',
                            style: GoogleFonts.montserrat(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: _canResend && !_isLoading
                                  ? const Color(0xFF59DBC7)
                                  : colorOutline.withOpacity(0.5),
                              letterSpacing: 1.0,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),
                    Container(
                      height: 58,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: colorPrimaryContainer.withOpacity(0.15),
                            blurRadius: 40,
                            offset: const Offset(0, 20),
                          ),
                        ],
                      ),
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: colorPrimaryContainer,
                          foregroundColor: colorOnPrimaryFixed,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 0,
                        ),
                        onPressed: (_isVerifying || _isLoading) ? null : _verifyOTP,
                        child: _isVerifying || _isLoading
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.5,
                                  color: Color(0xFF001F24),
                                ),
                              )
                            : Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    'Verify & Proceed',
                                    style: GoogleFonts.montserrat(
                                      fontSize: 20,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  const Icon(Icons.arrow_forward, size: 20),
                                ],
                              ),
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOtpField(int index, Color activeAccent) {
    return SizedBox(
      width: 72,
      height: 88,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
          child: TextField(
            controller: _controllers[index],
            focusNode: _focusNodes[index],
            keyboardType: TextInputType.number,
            textAlign: TextAlign.center,
            maxLength: 1,
            maxLines: 1,
            showCursor: false,
            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            style: GoogleFonts.montserrat(
              fontSize: 36,
              fontWeight: FontWeight.w700,
              color: activeAccent,
            ),
            decoration: InputDecoration(
              counterText: "",
              filled: true,
              fillColor: Colors.white.withOpacity(0.05),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(
                  color: Color(0xFF00E5FF),
                  width: 1.5,
                ),
              ),
              errorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(
                  color: Color(0xFFFF6B6B),
                  width: 1.5,
                ),
              ),
            ),
            onChanged: (value) {
              _handleOtpChange(value, index);
            },
          ),
        ),
      ),
    );
  }
}