import 'dart:math' as math;
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:seasoul/ui/review_page.dart';

class payment_success extends StatefulWidget {
  final String? bookingId;
  final String? productId;
  final String? activityId;
  final String itemName;
  final String itemType;
  final double amount;

  const payment_success({
    super.key,
    this.bookingId,
    this.productId,
    this.activityId,
    this.itemName = 'Package',
    this.itemType = 'product',
    this.amount = 0,
  });

  @override
  State<payment_success> createState() => _payment_successState();
}

class _payment_successState extends State<payment_success>
    with SingleTickerProviderStateMixin {
  late AnimationController _confettiController;
  final List<ConfettiParticle> _particles = [];
  final String _bookingRef = "SSH-98234";

  static const Color deepNavy = Color(0xFF1A2B49);
  static const Color oceanBlue = Color(0xFF0099CC);
  static const Color turquoiseLagoon = Color(0xFF00C2A8);
  static const Color sunsetOrange = Color(0xFFFFB84D);
  static const Color outline = Color(0xFF6E7880);
  static const Color sandWhite = Color(0xFFF8FBFF);

  @override
  void initState() {
    super.initState();

    _confettiController =
        AnimationController(vsync: this, duration: const Duration(seconds: 4))
          ..addListener(() {
            _updateConfettiParticles();
          });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initConfettiParticles();
      _confettiController.repeat();
    });
  }

  @override
  void dispose() {
    _confettiController.dispose();
    super.dispose();
  }

  void _initConfettiParticles() {
    final Size size = MediaQuery.of(context).size;
    final random = math.Random();
    final colors = [oceanBlue, turquoiseLagoon, sunsetOrange, Colors.white];

    for (int i = 0; i < 120; i++) {
      _particles.add(
        ConfettiParticle(
          x: random.nextDouble() * size.width,
          y: -random.nextDouble() * 200 - 10,
          size: random.nextDouble() * 8 + 6,
          speedY: random.nextDouble() * 3 + 2,
          speedX: random.nextDouble() * 2 - 1,
          color: colors[random.nextInt(colors.length)],
          rotation: random.nextDouble() * 360,
          rotationSpeed: random.nextDouble() * 4 - 2,
        ),
      );
    }
  }

  void _updateConfettiParticles() {
    final Size size = MediaQuery.of(context).size;
    setState(() {
      for (var p in _particles) {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        if (p.y > size.height) {
          p.y = -20;
          p.x = math.Random().nextDouble() * size.width;
        }
      }
    });
  }

  void _copyToClipboard() {
    Clipboard.setData(ClipboardData(text: _bookingRef));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Booking reference $_bookingRef copied!'),
        backgroundColor: deepNavy,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          Positioned.fill(
            child: Container(
              decoration: const BoxDecoration(
                image: DecorationImage(
                  image: NetworkImage(
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuCBwpxlFN6EJqJj8ilmhKY0bq--7hJhZzyV-bL5oLfKd_FYetmDIHX4z1j2kdQVlFUEltzY2Agl9MW4XWT7enhhSTV7RXKZOahP3109dKDnSx76ehnXUGD46W43jkyWDo5TULHybTOdKBseWynGft5QAoIblvgqvfeHC_LhA9DhQ2iMCWVEBTOeiFFNLDzrQKoP2U_hm8MN9C53KQEwNsD4urHqMS7P5FsGI-3SbW_eHiTCnIy3FKUthAEeNzxt7gfL6YgYHV11A8I',
                  ),
                  fit: BoxFit.cover,
                ),
              ),
              child: Container(color: deepNavy.withOpacity(0.25)),
            ),
          ),

          Positioned.fill(
            child: IgnorePointer(
              child: CustomPaint(
                painter: ConfettiPainter(particles: _particles),
              ),
            ),
          ),

          SafeArea(
            child: Column(
              children: [
                _buildHeaderBar(context),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20.0,
                      vertical: 16.0,
                    ),
                    child: Column(
                      children: [
                        _buildSuccessCard(),
                        const SizedBox(height: 24),
                        _buildHelpfulTipsGrid(),
                        // ✅ Review Button - Show after payment success
                        if (widget.bookingId != null)
                          Padding(
                            padding: const EdgeInsets.only(top: 16),
                            child: _buildReviewButton(),
                          ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeaderBar(BuildContext context) {
    return Container(
      height: 60,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          GestureDetector(
            onTap: () => Navigator.maybePop(context),
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.8),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.arrow_back, color: deepNavy, size: 22),
            ),
          ),
          const Text(
            'LAKSHADWEEP',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w900,
              color: Colors.white,
              letterSpacing: 1.5,
              shadows: [
                Shadow(
                  color: Colors.black26,
                  blurRadius: 4,
                  offset: Offset(0, 2),
                ),
              ],
            ),
          ),
          const SizedBox(width: 38),
        ],
      ),
    );
  }

  Widget _buildSuccessCard() {
    return ClipRRect(
      borderRadius: BorderRadius.circular(32),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.75),
            borderRadius: BorderRadius.circular(32),
            border: Border.all(color: Colors.white.withOpacity(0.4)),
          ),
          child: Column(
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: turquoiseLagoon.withOpacity(0.2),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_circle_outline,
                  color: turquoiseLagoon,
                  size: 48,
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'Payment Successful!',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: deepNavy,
                ),
              ),
              const SizedBox(height: 10),
              Center(
                child: Text(
                  "Your payment of ₹${widget.amount} has been processed successfully. We've sent the receipt to your email.",
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 15,
                    color: outline,
                    height: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 24),

              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 12,
                ),
                decoration: BoxDecoration(
                  color: sandWhite.withOpacity(0.6),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withOpacity(0.4)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'BOOKING REFERENCE',
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 10,
                            color: outline,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                          ),
                        ),
                        Text(
                          _bookingRef,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: deepNavy,
                          ),
                        ),
                      ],
                    ),
                    TextButton.icon(
                      onPressed: _copyToClipboard,
                      icon: const Icon(
                        Icons.content_copy,
                        size: 16,
                        color: oceanBlue,
                      ),
                      label: const Text(
                        'Copy ID',
                        style: TextStyle(
                          color: oceanBlue,
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              _buildBentoActionTile(
                isPrimary: true,
                icon: Icons.assignment_ind_outlined,
                title: 'View Entry Permit',
                subtitle: 'Required for island access',
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _buildBentoActionTile(
                      isPrimary: false,
                      icon: Icons.calendar_month_outlined,
                      title: 'Add to Calendar',
                      subtitle: 'Sync travel dates',
                      tileColor: sunsetOrange,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildBentoActionTile(
                      isPrimary: false,
                      icon: Icons.ios_share_outlined,
                      title: 'Share Itinerary',
                      subtitle: 'Send to travel buddies',
                      tileColor: oceanBlue,
                    ),
                  ),
                ],
              ),
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 24.0),
                child: Divider(color: Colors.white30, thickness: 1),
              ),

              const Text(
                'Need help? Our experts are online.',
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 14,
                  color: outline,
                ),
              ),
              const SizedBox(height: 14),
              Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(999),
                  gradient: const LinearGradient(
                    colors: [oceanBlue, turquoiseLagoon],
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: oceanBlue.withOpacity(0.3),
                      blurRadius: 16,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: ElevatedButton.icon(
                  onPressed: () {},
                  icon: const Icon(
                    Icons.chat_bubble_outline,
                    color: Colors.white,
                    size: 18,
                  ),
                  label: const Text(
                    'Chat with an Expert',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBentoActionTile({
    required bool isPrimary,
    required IconData icon,
    required String title,
    required String subtitle,
    Color tileColor = oceanBlue,
  }) {
    if (isPrimary) {
      return Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: const Color(0xFF007da8),
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF007da8).withOpacity(0.2),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(icon, color: Colors.white, size: 24),
                ),
                const SizedBox(width: 14),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 12,
                        color: Colors.white.withOpacity(0.8),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const Icon(Icons.chevron_right, color: Colors.white),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.8),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: tileColor.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: tileColor, size: 20),
          ),
          const SizedBox(height: 12),
          Text(
            title,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: deepNavy,
            ),
          ),
          Text(
            subtitle,
            style: const TextStyle(
              fontFamily: 'Inter',
              fontSize: 11,
              color: outline,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHelpfulTipsGrid() {
    final tips = [
      {
        'icon': Icons.wb_sunny_outlined,
        'title': 'Weather Check',
        'desc': 'Sunny 28°C in Agatti',
      },
      {
        'icon': Icons.luggage_outlined,
        'title': 'Packing Tip',
        'desc': 'Eco-friendly sunscreen',
      },
      {
        'icon': Icons.flight_takeoff_outlined,
        'title': 'Flight Info',
        'desc': 'Check-in opens in 48h',
      },
    ];

    return Row(
      children: tips.map((tip) {
        return Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4.0),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(tip['icon'] as IconData, color: turquoiseLagoon, size: 20),
                const SizedBox(width: 6),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        tip['title'] as String,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: deepNavy,
                        ),
                      ),
                      Text(
                        tip['desc'] as String,
                        style: const TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 11,
                          color: outline,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  // ✅ Review Button Widget
  Widget _buildReviewButton() {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        color: Colors.white.withOpacity(0.9),
        border: Border.all(color: Colors.white.withOpacity(0.4)),
        boxShadow: [
          BoxShadow(
            color: deepNavy.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ElevatedButton.icon(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ReviewPage(
                bookingId: widget.bookingId!,
                productId: widget.productId,
                activityId: widget.activityId,
                itemName: widget.itemName,
                itemType: widget.itemType,
              ),
            ),
          ).then((result) {
            if (result == true) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('✅ Thank you for your review!'),
                  backgroundColor: Colors.green,
                  duration: Duration(seconds: 2),
                ),
              );
            }
          });
        },
        icon: const Icon(
          Icons.star_border,
          color: Colors.white,
          size: 24,
        ),
        label: const Text(
          'Write a Review',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFFFFB84D),
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          padding: const EdgeInsets.symmetric(vertical: 14),
          elevation: 0,
        ),
      ),
    );
  }
}

class ConfettiParticle {
  double x, y, size, speedY, speedX, rotation, rotationSpeed;
  Color color;
  ConfettiParticle({
    required this.x,
    required this.y,
    required this.size,
    required this.speedY,
    required this.speedX,
    required this.color,
    required this.rotation,
    required this.rotationSpeed,
  });
}

class ConfettiPainter extends CustomPainter {
  final List<ConfettiParticle> particles;
  ConfettiPainter({required this.particles});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..style = PaintingStyle.fill;
    for (var p in particles) {
      paint.color = p.color;
      canvas.save();
      canvas.translate(p.x, p.y);
      canvas.rotate(p.rotation * math.pi / 180);
      canvas.drawRect(
        Rect.fromCenter(center: Offset.zero, width: p.size, height: p.size),
        paint,
      );
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}