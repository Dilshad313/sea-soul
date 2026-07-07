import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:audioplayers/audioplayers.dart';
import 'dart:io';

class NotificationService {
  static final FlutterLocalNotificationsPlugin _notifications =
      FlutterLocalNotificationsPlugin();

  static final AudioPlayer _audioPlayer = AudioPlayer();
  static bool _isSoundEnabled = true;

  // ✅ Initialize notifications
  static Future<void> init() async {
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

    await _notifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: (NotificationResponse details) {
        // Handle notification tap
        print('Notification tapped: ${details.payload}');
      },
    );

    // Request permissions
    await _notifications.resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>()?.requestNotificationsPermission();
  }

  // ✅ Show local notification
  static Future<void> showNotification({
    required String title,
    required String body,
    String? payload,
  }) async {
    const AndroidNotificationDetails androidDetails =
        AndroidNotificationDetails(
      'seasoul_channel',
      'SeaSoul Notifications',
      channelDescription: 'SeaSoul app notifications',
      importance: Importance.high,
      priority: Priority.high,
      icon: '@mipmap/ic_launcher',
      playSound: true,
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
      0, // Notification ID
      title,
      body,
      details,
      payload: payload,
    );

    // ✅ Play sound
    if (_isSoundEnabled) {
      await playNotificationSound();
    }
  }

  // ✅ Play notification sound
  static Future<void> playNotificationSound() async {
    try {
      // Check if sound file exists in assets
      await _audioPlayer.play(AssetSource('sounds/notification.mp3'));
    } catch (e) {
      // If no custom sound, play default system sound
      try {
        await _audioPlayer.play(AssetSource('sounds/default_notification.mp3'));
      } catch (e2) {
        print('❌ Sound file not found. Please add notification.mp3 to assets/sounds/');
        // Fallback: use system sound (only works on native)
        if (Platform.isAndroid || Platform.isIOS) {
          await _audioPlayer.play(AssetSource('sounds/notification.mp3'));
        }
      }
    }
  }

  // ✅ Toggle sound
  static void toggleSound(bool enable) {
    _isSoundEnabled = enable;
  }

  // ✅ Dispose
  static void dispose() {
    _audioPlayer.dispose();
  }
}