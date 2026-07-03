import 'package:flutter/material.dart';
import 'package:seasoul/login.dart';
import 'package:seasoul/signup.dart';
import 'package:seasoul/splashscreen.dart';
import 'package:flutter/foundation.dart' show kIsWeb;

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
    home: const SplashScreen(),
    debugShowCheckedModeBanner: false,
    theme: ThemeData(
        useMaterial3: true,
        // Web-specific constraints
      ),
    );
  }
}

