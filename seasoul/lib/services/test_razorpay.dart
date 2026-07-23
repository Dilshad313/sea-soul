// // test_razorpay.dart
// import 'package:flutter/material.dart';
// import 'package:seasoul/services/payment_service.dart';
// import 'package:seasoul/services/auth_services.dart';

// class TestRazorpayScreen extends StatefulWidget {
//   const TestRazorpayScreen({super.key});

//   @override
//   State<TestRazorpayScreen> createState() => _TestRazorpayScreenState();
// }

// class _TestRazorpayScreenState extends State<TestRazorpayScreen> {
//   bool _isLoading = false;
//   String _status = 'Ready';
//   String _razorpayKey = '';

//   @override
//   void initState() {
//     super.initState();
//     _initializeRazorpay();
//   }

//   void _initializeRazorpay() {
//     RazorpayService.initialize(
//       successCallback: (response) {
//         setState(() {
//           _status = '✅ Payment Successful: ${response.paymentId}';
//           _isLoading = false;
//         });
//         ScaffoldMessenger.of(context).showSnackBar(
//           const SnackBar(content: Text('✅ Payment Successful!'), backgroundColor: Colors.green),
//         );
//       },
//       errorCallback: (response) {
//         setState(() {
//           _status = '❌ Payment Failed: ${response.message}';
//           _isLoading = false;
//         });
//         ScaffoldMessenger.of(context).showSnackBar(
//           SnackBar(content: Text('❌ Payment Failed: ${response.message}'), backgroundColor: Colors.red),
//         );
//       },
//     );
//   }

//   Future<void> _testPayment() async {
//     if (_isLoading) return;

//     setState(() {
//       _isLoading = true;
//       _status = 'Creating order...';
//     });

//     try {
//       // Get user
//       final user = await AuthService.getCurrentUser();
//       print('📱 User: $user');

//       // Create order
//       final order = await RazorpayService.createOrder(
//         amount: 100, // ₹100 for testing
//         receipt: 'TEST_${DateTime.now().millisecondsSinceEpoch}',
//         notes: {'test': 'true'},
//       );

//       setState(() {
//         _status = 'Order created: ${order['id']}';
//       });

//       // Get key
//       final keyId = await RazorpayService.getRazorpayKey();
//       setState(() {
//         _razorpayKey = keyId;
//         _status = 'Opening checkout...';
//       });

//       // Open checkout
//       await RazorpayService.openCheckout(
//         keyId: keyId,
//         orderId: order['id'],
//         amount: 100,
//         receipt: order['receipt'] ?? 'test_receipt',
//         itemName: 'Test Payment',
//         customerName: user?['fullName'] ?? 'Test User',
//         customerEmail: user?['email'] ?? 'test@example.com',
//         customerContact: user?['phone'] ?? '9999999999',
//       );

//       setState(() {
//         _status = 'Checkout opened. Complete payment...';
//       });
//     } catch (e) {
//       setState(() {
//         _status = '❌ Error: $e';
//         _isLoading = false;
//       });
//       ScaffoldMessenger.of(context).showSnackBar(
//         SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
//       );
//     }
//   }

//   @override
//   void dispose() {
//     RazorpayService.dispose();
//     super.dispose();
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(
//         title: const Text('Test Razorpay'),
//         backgroundColor: Colors.blue,
//         foregroundColor: Colors.white,
//       ),
//       body: Padding(
//         padding: const EdgeInsets.all(20),
//         child: Column(
//           mainAxisAlignment: MainAxisAlignment.center,
//           children: [
//             Card(
//               child: Padding(
//                 padding: const EdgeInsets.all(20),
//                 child: Column(
//                   children: [
//                     const Text(
//                       'Razorpay Test',
//                       style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
//                     ),
//                     const SizedBox(height: 20),
//                     Text(
//                       _status,
//                       textAlign: TextAlign.center,
//                       style: TextStyle(
//                         fontSize: 16,
//                         color: _status.contains('✅') ? Colors.green : 
//                                _status.contains('❌') ? Colors.red : Colors.black,
//                       ),
//                     ),
//                     const SizedBox(height: 10),
//                     if (_razorpayKey.isNotEmpty)
//                       Text('Key: $_razorpayKey', style: const TextStyle(fontSize: 12)),
//                     const SizedBox(height: 30),
//                     SizedBox(
//                       width: double.infinity,
//                       child: ElevatedButton(
//                         onPressed: _isLoading ? null : _testPayment,
//                         style: ElevatedButton.styleFrom(
//                           backgroundColor: Colors.blue,
//                           padding: const EdgeInsets.symmetric(vertical: 16),
//                           shape: RoundedRectangleBorder(
//                             borderRadius: BorderRadius.circular(12),
//                           ),
//                         ),
//                         child: _isLoading
//                             ? const SizedBox(
//                                 width: 20,
//                                 height: 20,
//                                 child: CircularProgressIndicator(
//                                   color: Colors.white,
//                                   strokeWidth: 2,
//                                 ),
//                               )
//                             : const Text(
//                                 'Test Payment ₹100',
//                                 style: TextStyle(fontSize: 18, color: Colors.white),
//                               ),
//                       ),
//                     ),
//                   ],
//                 ),
//               ),
//             ),
//             const SizedBox(height: 20),
//             const Text(
//               'Make sure:\n1. Backend is running\n2. Razorpay keys are set\n3. User is logged in',
//               textAlign: TextAlign.center,
//               style: TextStyle(fontSize: 12, color: Colors.grey),
//             ),
//           ],
//         ),
//       ),
//     );
//   }
// }