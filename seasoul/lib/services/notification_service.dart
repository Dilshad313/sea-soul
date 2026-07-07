import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:audioplayers/audioplayers.dart';
import 'dart:io';

class NotificationService {
  static final FlutterLocalNotificationsPlugin _notifications =
      FlutterLocalNotificationsPlugin();

  static final AudioPlayer _audioPlayer = AudioPlayer();
  static bool _isSoundEnabled = true;
  static bool _isInitialized = false;

  // ✅ Initialize notifications
  static Future<void> init() async {
    if (_isInitialized) return;
    
    print('🔔 Initializing notification service...');

    const AndroidInitializationSettings androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    
    const DarwinInitializationSettings iosSettings =
        DarwinInitializationSettings(
          requestAlertPermission: true,
          requestBadgePermission: true,
          requestSoundPermission: true,
        );

    const InitializationSettings initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    try {
      await _notifications.initialize(
        initSettings,
        onDidReceiveNotificationResponse: (NotificationResponse details) {
          print('🔔 Notification tapped: ${details.payload}');
        },
      );
      print('✅ Notification service initialized');
    } catch (e) {
      print('❌ Notification initialization error: $e');
    }

    // Request permissions
    try {
      await _notifications.resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin>()?.requestNotificationsPermission();
      print('✅ Notification permissions requested');
    } catch (e) {
      print('❌ Permission request error: $e');
    }

    _isInitialized = true;
  }

  // ✅ Show local notification with sound
  static Future<void> showNotification({
    required String title,
    required String body,
    String? payload,
  }) async {
    print('🔔 Showing notification: $title');
    print('🔔 Body: $body');

    try {
      const AndroidNotificationDetails androidDetails =
          AndroidNotificationDetails(
        'seasoul_channel',
        'SeaSoul Notifications',
        channelDescription: 'SeaSoul app notifications',
        importance: Importance.high,
        priority: Priority.high,
        icon: '@mipmap/ic_launcher',
        playSound: true,
        sound: RawResourceAndroidNotificationSound('notification'),
      );

      const DarwinNotificationDetails iosDetails =
          DarwinNotificationDetails(
            presentAlert: true,
            presentBadge: true,
            presentSound: true,
          );

      const NotificationDetails details = NotificationDetails(
        android: androidDetails,
        iOS: iosDetails,
      );

      await _notifications.show(
        DateTime.now().millisecond,
        title,
        body,
        details,
        payload: payload,
      );
      print('✅ Notification shown successfully');

      // ✅ Play sound
      if (_isSoundEnabled) {
        await playNotificationSound();
      }
    } catch (e) {
      print('❌ Error showing notification: $e');
    }
  }

  // ✅ Play notification sound
  static Future<void> playNotificationSound() async {
    print('🔊 Playing notification sound...');
    try {
      // Try to play from assets
      await _audioPlayer.play(AssetSource('sounds/notification.mp3'));
      print('✅ Sound played from assets');
    } catch (e) {
      print('❌ Sound file not found: $e');
      // Try alternative sound
      try {
        await _audioPlayer.play(AssetSource('sounds/default_notification.mp3'));
        print('✅ Sound played from assets (alternative)');
      } catch (e2) {
        print('❌ No sound file found');
      }
    }
  }

  // ✅ Play custom sound
  static Future<void> playSound(String soundFile) async {
    try {
      await _audioPlayer.play(AssetSource(soundFile));
      print('✅ Sound played: $soundFile');
    } catch (e) {
      print('❌ Error playing sound: $e');
    }
  }

  // ✅ Toggle sound
  static void toggleSound(bool enable) {
    _isSoundEnabled = enable;
    print('🔊 Sound ${enable ? 'enabled' : 'disabled'}');
  }

  // ✅ Dispose
  static void dispose() {
    _audioPlayer.dispose();
  }
}