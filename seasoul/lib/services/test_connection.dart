import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:seasoul/constants/api_constants.dart';
import 'dart:io';

class TestConnectionScreen extends StatefulWidget {
  const TestConnectionScreen({super.key});

  @override
  State<TestConnectionScreen> createState() => _TestConnectionScreenState();
}

class _TestConnectionScreenState extends State<TestConnectionScreen> {
  String _status = 'Testing connection...';
  bool _isLoading = true;
  String _details = '';
  String _responseTime = '--';
  int _statusCode = 0;
  bool _isConnected = false;
  String _testedUrl = '';

  @override
  void initState() {
    super.initState();
    _testConnection();
  }

  Future<void> _testConnection() async {
    setState(() {
      _isLoading = true;
      _status = 'Testing connection...';
      _details = '';
      _isConnected = false;
    });

    final String url = ApiConstants.baseUrl;
    _testedUrl = url;

    print('📡 Testing connection to: $url');
    print('📍 This should be: https://sea-soul-backend.vercel.app');

    if (url.contains('localhost')) {
      setState(() {
        _status = '⚠️ Using Localhost URL';
        _details =
            'Your app is trying to connect to:\n'
            '$url\n\n'
            '⚠️ This is a local development URL.\n'
            'Your device cannot access localhost\n'
            'unless the backend is running on your machine.\n\n'
            '✅ Fix: Change baseUrl in api_constants.dart to:\n'
            'https://sea-soul-backend.vercel.app';
        _isLoading = false;
      });
      return;
    }

    try {
      final startTime = DateTime.now();

      final response = await http
          .get(Uri.parse(url), headers: {'Content-Type': 'application/json'})
          .timeout(const Duration(seconds: 10));

      final endTime = DateTime.now();
      _responseTime = '${endTime.difference(startTime).inMilliseconds} ms';
      _statusCode = response.statusCode;

      _isConnected = true;

      setState(() {
        _status = '✅ Connected to Vercel Backend!';
        _details =
            '✓ Server is reachable\n'
            '✓ URL: $url\n'
            '✓ Status Code: ${response.statusCode}\n'
            '✓ Response Time: $_responseTime\n\n'
            '🎉 Your backend is working!\n'
            'You can now use all API features.';
        _isLoading = false;
      });
    } on SocketException {
      setState(() {
        _status = '❌ Network Error';
        _details =
            'No internet connection or server unreachable.\n'
            'URL: $url\n\n'
            'Check:\n'
            '• Internet connection\n'
            '• If the URL is correct\n'
            '• If backend is deployed on Vercel';
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _status = '❌ Connection Failed';
        _details =
            'Could not reach the server\n\n'
            'URL: $url\n'
            'Error: $e\n\n'
            'Possible issues:\n'
            '• Backend not deployed\n'
            '• Wrong URL\n'
            '• CORS not enabled\n'
            '• Server is down\n\n'
            '💡 Visit in browser: $url';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Backend Connection Test'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _testConnection,
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              // Status Card
              Expanded(
                flex: 2,
                child: _isLoading
                    ? const Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            CircularProgressIndicator(),
                            SizedBox(height: 20),
                            Text(
                              'Testing connection...',
                              style: TextStyle(fontSize: 16),
                            ),
                          ],
                        ),
                      )
                    : Card(
                        elevation: 4,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(20.0),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                _status.contains('✅')
                                    ? Icons.check_circle
                                    : _status.contains('⚠️')
                                    ? Icons.warning
                                    : Icons.error,
                                size: 60,
                                color: _status.contains('✅')
                                    ? Colors.green
                                    : _status.contains('⚠️')
                                    ? Colors.orange
                                    : Colors.red,
                              ),
                              const SizedBox(height: 15),
                              Text(
                                _status,
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: _status.contains('✅')
                                      ? Colors.green
                                      : _status.contains('⚠️')
                                      ? Colors.orange
                                      : Colors.red,
                                ),
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 10),
                              Expanded(
                                child: SingleChildScrollView(
                                  child: Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: Colors.grey[50],
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(
                                        color: Colors.grey[300]!,
                                      ),
                                    ),
                                    child: Text(
                                      _details,
                                      style: const TextStyle(
                                        fontSize: 13,
                                        color: Colors.black87,
                                        height: 1.5,
                                      ),
                                      textAlign: TextAlign.left,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
              ),

              const SizedBox(height: 16),

              // Info Card
              Card(
                elevation: 2,
                child: Padding(
                  padding: const EdgeInsets.all(12.0),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Current URL:',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                          Expanded(
                            child: Text(
                              _testedUrl.isNotEmpty
                                  ? _testedUrl
                                  : ApiConstants.baseUrl,
                              style: TextStyle(
                                fontSize: 12,
                                color: _testedUrl.contains('localhost')
                                    ? Colors.red
                                    : Colors.blue,
                              ),
                              textAlign: TextAlign.right,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Status:',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: _isConnected
                                  ? Colors.green[100]
                                  : Colors.red[100],
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              _isConnected ? '🟢 Online' : '🔴 Offline',
                              style: TextStyle(
                                color: _isConnected
                                    ? Colors.green[800]
                                    : Colors.red[800],
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                      if (_statusCode != 0) ...[
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Status Code:',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                            Text(
                              '$_statusCode',
                              style: TextStyle(
                                color: _statusCode >= 200 && _statusCode < 400
                                    ? Colors.green
                                    : Colors.orange,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ],
                      if (_responseTime != '--') ...[
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Response Time:',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                            Text(_responseTime),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Buttons
              Wrap(
                spacing: 8,
                runSpacing: 8,
                alignment: WrapAlignment.center,
                children: [
                  ElevatedButton.icon(
                    onPressed: _isLoading ? null : _testConnection,
                    icon: const Icon(Icons.refresh),
                    label: const Text('Re-test'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
                      foregroundColor: Colors.white,
                    ),
                  ),
                  ElevatedButton.icon(
                    onPressed: () {
                      // Open URL in browser
                      // Add url_launcher package for this
                    },
                    icon: const Icon(Icons.open_in_browser),
                    label: const Text('Open in Browser'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.purple,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
