import 'package:flutter/material.dart';

import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:provider/provider.dart';
import 'package:seasoul/providers/notification_provider.dart';
import 'package:seasoul/services/notification_service.dart';
import 'package:seasoul/ui/splashscreen.dart';


void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await NotificationService.init();
  
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => NotificationProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SeaSoul Holidays',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        fontFamily: 'Inter',
      ),
      home:  SplashScreen(),
    );
  }
}