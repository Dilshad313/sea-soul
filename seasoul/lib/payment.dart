import 'package:flutter/material.dart';
import 'package:seasoul/payment_succes.dart';

class payment extends StatefulWidget {
  const payment({super.key});

  @override
  State<payment> createState() => _paymentState();
}

const Color primaryToken = Color(0xFF006386);

class _paymentState extends State<payment> {
  int _selectedMethodIndex = 0;
  bool _saveCardDetails = false;
  bool _isProcessing = false;
  bool _isSuccess = false;

  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _cardNumberController = TextEditingController();
  final _expiryController = TextEditingController();
  final _cvvController = TextEditingController();

  static const Color deepNavy = Color(0xFF1A2B49);
  static const Color oceanBlue = Color(0xFF0099CC);
  static const Color turquoiseLagoon = Color(0xFF00C2A8);
  static const Color sunsetOrange = Color(0xFFFFB84D);
  static const Color outline = Color(0xFF6E7880);
  static const Color sandWhite = Color(0xFFF8FBFF);
  static const Color secondaryContainer = Color(0xFFE0E8FF);
  static const Color greenSecondary = Color(0xFF006B5C);

  @override
  void dispose() {
    _nameController.dispose();
    _cardNumberController.dispose();
    _expiryController.dispose();
    _cvvController.dispose();
    super.dispose();
  }

  void _processPaymentMock() async {
    setState(() {
      _isProcessing = true;
    });

    await Future.delayed(const Duration(seconds: 2));

    setState(() {
      _isProcessing = false;
      _isSuccess = true;
    });

    await Future.delayed(const Duration(seconds: 1));

    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => payment_success()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: sandWhite,
      appBar: AppBar(
        backgroundColor: Colors.white.withOpacity(0.8),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: primaryToken),
          onPressed: () => Navigator.maybePop(context),
        ),
        title: const Text(
          'Secure Payment',
          style: TextStyle(
            color: deepNavy,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: secondaryContainer.withOpacity(0.4),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.verified_user, color: greenSecondary, size: 14),
                    SizedBox(width: 4),
                    Text(
                      'SSL SECURED',
                      style: TextStyle(
                        color: greenSecondary,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),

      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildBookingSummaryCard(),
            const SizedBox(height: 16),
            _buildTrustBadgeMetrics(),
            const SizedBox(height: 24),
            _buildPaymentMethodsAccordion(),
            const SizedBox(height: 24),
            _buildActionTriggerButton(),
            const SizedBox(height: 24),
            _buildContextualHelpCard(),
          ],
        ),
      ),
    );
  }

  Widget _buildBookingSummaryCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.3)),
        boxShadow: [
          BoxShadow(
            color: deepNavy.withOpacity(0.04),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.receipt_long_outlined, color: outline, size: 20),
              SizedBox(width: 8),
              Text(
                'Booking Summary',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: deepNavy,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Container(
                width: 76,
                height: 76,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  image: const DecorationImage(
                    image: NetworkImage(
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuBT78f-PrqPhBVVU9sJf2RyhnGy5NJzEdjMnwByrNBhq0CwjeI2pwbYEm55GhMeThzmX4pTEeT3UyezypDGMzXu3p4tYu_QqYldVWD5-HoI33WonCXKRxyJL7VdzjfLMJJEz4ZI8EwROUGhisOZvbEJsfMK9FH0lwBFmT8WPWhbq71zTSesBY3oEmm3b14FNjWwHUl-JKrZTzQIKIUjlS_4taj5PBd56wAImJtLWmmU0AlwhdBxgyoLDv-SLGY_gQOOrg04M6OV2vs',
                    ),
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Agatti Escape',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: primaryToken,
                      ),
                    ),
                    const Text(
                      'Lakshadweep Premium Villa',
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 13,
                        color: outline,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: List.generate(
                        5,
                        (index) => const Icon(
                          Icons.star,
                          color: sunsetOrange,
                          size: 14,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 16.0),
            child: Divider(color: Color(0xFFF1F3FF), thickness: 1),
          ),
          _buildSummaryItemRow('Dates', 'Oct 12 - Oct 18, 2024'),
          const SizedBox(height: 12),
          _buildSummaryItemRow('Travelers', '2 Adults, 1 Luxury Suite'),
          const SizedBox(height: 12),
          _buildSummaryItemRow('Tax & Fees', '₹14,400'),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 16.0),
            child: Divider(color: Color(0xFFE8EDFF), thickness: 1.5, height: 1),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'TOTAL AMOUNT',
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: outline.withOpacity(0.8),
                      letterSpacing: 0.5,
                    ),
                  ),
                  const Text(
                    '₹1,36,400',
                    style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.bold,
                      color: primaryToken,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: greenSecondary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text(
                  'Refundable',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: greenSecondary,
                    fontFamily: 'Inter',
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryItemRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontFamily: 'Inter',
            fontSize: 14,
            color: outline,
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            fontFamily: 'Inter',
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: deepNavy,
          ),
        ),
      ],
    );
  }

  Widget _buildTrustBadgeMetrics() {
    return Row(
      children: [
        _buildSingleBadge(Icons.verified_outlined, 'PCI-DSS Compliant'),
        const SizedBox(width: 12),
        _buildSingleBadge(
          Icons.enhanced_encryption_outlined,
          '256-bit AES Protection',
        ),
      ],
    );
  }

  Widget _buildSingleBadge(IconData icon, String message) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.7),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.white.withOpacity(0.4)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: oceanBlue, size: 20),
            const SizedBox(width: 8),
            Flexible(
              child: Text(
                message,
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: deepNavy,
                  fontFamily: 'Inter',
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentMethodsAccordion() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: deepNavy.withOpacity(0.02),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.all(12.0),
            child: Row(
              children: [
                Icon(
                  Icons.account_balance_wallet_outlined,
                  color: outline,
                  size: 20,
                ),
                SizedBox(width: 8),
                Text(
                  'Select Payment Method',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: deepNavy,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),

          _buildAccordionHeader(0, Icons.credit_card, 'Credit / Debit Card'),
          if (_selectedMethodIndex == 0) _buildCardInputForm(),

          _buildAccordionHeader(1, Icons.smartphone, 'UPI / GPay / Apple Pay'),

          _buildAccordionHeader(2, Icons.account_balance, 'Net Banking'),
        ],
      ),
    );
  }

  Widget _buildAccordionHeader(int index, IconData icon, String label) {
    final isSelected = _selectedMethodIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _selectedMethodIndex = index),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : const Color(0xFFF9F9FF),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? oceanBlue.withOpacity(0.3) : Colors.transparent,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Icon(icon, color: isSelected ? primaryToken : outline),
                const SizedBox(width: 16),
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: deepNavy,
                  ),
                ),
              ],
            ),
            Icon(
              isSelected ? Icons.expand_less : Icons.expand_more,
              color: isSelected ? primaryToken : outline,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCardInputForm() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
      child: Form(
        key: _formKey,
        child: Column(
          children: [
            _buildTextField(
              label: 'Cardholder Name',
              hint: 'Johnathan Doe',
              controller: _nameController,
            ),
            const SizedBox(height: 16),
            _buildTextField(
              label: 'Card Number',
              hint: '0000 0000 0000 0000',
              controller: _cardNumberController,
              suffixIcon: Icons.lock_outline,
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildTextField(
                    label: 'Expiry Date',
                    hint: 'MM / YY',
                    controller: _expiryController,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildTextField(
                    label: 'CVV / CVC',
                    hint: '***',
                    controller: _cvvController,
                    obscureText: true,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Checkbox(
                  value: _saveCardDetails,
                  activeColor: oceanBlue,
                  onChanged: (val) =>
                      setState(() => _saveCardDetails = val ?? false),
                ),
                const Expanded(
                  child: Text(
                    'Save card details for future trips securely.',
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 13,
                      color: outline,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField({
    required String label,
    required String hint,
    required TextEditingController controller,
    IconData? suffixIcon,
    bool obscureText = false,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontFamily: 'Inter',
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: outline,
          ),
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller: controller,
          obscureText: obscureText,
          style: const TextStyle(
            fontFamily: 'Inter',
            fontSize: 15,
            color: deepNavy,
          ),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(color: outline.withOpacity(0.5)),
            filled: true,
            fillColor: Colors.white,
            suffixIcon: suffixIcon != null
                ? Icon(suffixIcon, size: 18, color: outline.withOpacity(0.5))
                : null,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 14,
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFBDC8D0)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: oceanBlue, width: 1.5),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildActionTriggerButton() {
    return SizedBox(
      width: double.infinity,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(999),
          gradient: _isSuccess
              ? null
              : const LinearGradient(colors: [oceanBlue, turquoiseLagoon]),
          color: _isSuccess ? greenSecondary : null,
          boxShadow: [
            BoxShadow(
              color: (_isSuccess ? greenSecondary : oceanBlue).withOpacity(
                0.24,
              ),
              blurRadius: 16,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: ElevatedButton(
          onPressed: (_isProcessing || _isSuccess) ? null : _processPaymentMock,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.transparent,
            shadowColor: Colors.transparent,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(999),
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (_isProcessing) ...[
                const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(
                    color: Colors.white,
                    strokeWidth: 2,
                  ),
                ),
                const SizedBox(width: 12),
                const Text(
                  'Processing...',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ] else if (_isSuccess) ...[
                const Icon(Icons.check_circle, color: Colors.white, size: 18),
                const SizedBox(width: 8),
                Text(
                  'Payment Successful',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ] else ...[
                const Icon(Icons.lock, color: Colors.white, size: 16),
                const SizedBox(width: 8),
                const Text(
                  'Pay ₹1,36,400',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildContextualHelpCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: const Border(left: BorderSide(color: sunsetOrange, width: 4)),
        boxShadow: [
          BoxShadow(
            color: deepNavy.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: sunsetOrange.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.info_outlined,
              color: sunsetOrange,
              size: 20,
            ),
          ),
          const SizedBox(width: 16),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Need help?',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: deepNavy,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  'Our travel specialists are available 24/7.',
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 12,
                    color: outline,
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
