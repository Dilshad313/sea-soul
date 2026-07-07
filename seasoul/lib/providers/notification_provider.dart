import 'package:flutter/material.dart';
import '../models/notification_model.dart';
import '../services/notification_service.dart';
import '../services/notification_api_service.dart';

class NotificationProvider extends ChangeNotifier {
  List<NotificationModel> _notifications = [];
  bool _isLoading = false;
  int _unreadCount = 0;
  bool _isInitialized = false;

  List<NotificationModel> get notifications => _notifications;
  bool get isLoading => _isLoading;
  int get unreadCount => _unreadCount;

  NotificationProvider() {
    _init();
  }

  Future<void> _init() async {
    if (_isInitialized) return;
    _isInitialized = true;
    await fetchNotifications();
  }

  // ✅ Fetch notifications from API
  Future<void> fetchNotifications() async {
    _isLoading = true;
    notifyListeners();

    try {
      print('📱 Fetching notifications from API...');
      final response = await NotificationApiService.getNotifications();
      
      print('📥 Response received: ${response['success']}');
      
      if (response['success'] == true) {
        final List<dynamic> notificationData = response['notifications'] ?? [];
        
        print('📊 Total notifications: ${notificationData.length}');
        
        // ✅ Safe parsing with null checks
        _notifications = notificationData
            .where((n) => n != null) // ✅ Filter out null values
            .map((n) => _safeParseNotification(n))
            .where((n) => n != null) // ✅ Filter out failed parses
            .cast<NotificationModel>()
            .toList();
        
        _unreadCount = response['unreadCount'] ?? 0;
        
        print('📊 Unread count: $_unreadCount');
        print('✅ Loaded ${_notifications.length} notifications');
      } else {
        print('❌ API returned success: false');
        _loadDummyNotifications();
      }
    } catch (e) {
      print('❌ Error fetching notifications: $e');
      _loadDummyNotifications();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // ✅ Safe notification parser with null checks
  NotificationModel? _safeParseNotification(dynamic data) {
    try {
      if (data == null) return null;
      
      // ✅ Safe string getter
      String getString(String key, {String defaultValue = ''}) {
        final value = data[key];
        return value != null ? value.toString() : defaultValue;
      }

      // ✅ Safe bool getter
      bool getBool(String key, {bool defaultValue = false}) {
        final value = data[key];
        if (value == null) return defaultValue;
        if (value is bool) return value;
        if (value is String) return value.toLowerCase() == 'true';
        return defaultValue;
      }

      // ✅ Safe DateTime getter
      DateTime? getDateTime(String key) {
        final value = data[key];
        if (value == null) return null;
        if (value is DateTime) return value;
        if (value is String) {
          try {
            return DateTime.parse(value);
          } catch (e) {
            return null;
          }
        }
        return null;
      }

      // ✅ Safe List getter
      List<String> getStringList(String key) {
        final value = data[key];
        if (value == null) return [];
        if (value is List) {
          return value.map((e) => e?.toString() ?? '').toList();
        }
        return [];
      }

      final id = getString('_id');
      if (id.isEmpty) return null; // ✅ Skip if no ID

      return NotificationModel(
        id: id,
        userId: getString('userId'),
        title: getString('title', defaultValue: 'Notification'),
        message: getString('message', defaultValue: ''),
        type: getString('type', defaultValue: 'general'),
        timestamp: getDateTime('createdAt') ?? getDateTime('timestamp') ?? DateTime.now(),
        isRead: getBool('isRead', defaultValue: false),
        imageUrl: getString('imageUrl'),
        relatedId: getString('relatedId'),
        data: data['data'] ?? {},
      );
    } catch (e) {
      print('❌ Error parsing notification: $e');
      return null;
    }
  }

  // ✅ Load dummy notifications (Fallback)
  void _loadDummyNotifications() {
    print('📱 Loading dummy notifications...');
    _notifications = [
      NotificationModel(
        id: '1',
        userId: 'user1',
        title: '🎉 Welcome to SeaSoul!',
        message: 'Explore the pristine islands of Lakshadweep with us.',
        type: 'general',
        timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
        isRead: false,
        imageUrl: null,
        relatedId: null,
        data: {},
      ),
      NotificationModel(
        id: '2',
        userId: 'user1',
        title: '📅 Booking Confirmed',
        message: 'Your Luxury Beach Resort booking has been confirmed.',
        type: 'booking',
        timestamp: DateTime.now().subtract(const Duration(hours: 2)),
        isRead: false,
        imageUrl: null,
        relatedId: null,
        data: {},
      ),
      NotificationModel(
        id: '3',
        userId: 'user1',
        title: '🌟 New Activity Added',
        message: 'Try our new Sunset Kayaking experience at Agatti Island!',
        type: 'activity',
        timestamp: DateTime.now().subtract(const Duration(hours: 5)),
        isRead: false,
        imageUrl: null,
        relatedId: null,
        data: {},
      ),
    ];
    _unreadCount = _notifications.where((n) => !n.isRead).length;
    notifyListeners();
  }

  void _updateUnreadCount() {
    _unreadCount = _notifications.where((n) => !n.isRead).length;
    notifyListeners();
  }

  // ✅ Mark as read
  void markAsRead(String id) async {
    try {
      print('📖 Marking notification as read: $id');
      await NotificationApiService.markAsRead(id);
      
      final index = _notifications.indexWhere((n) => n.id == id);
      if (index != -1) {
        final old = _notifications[index];
        _notifications[index] = NotificationModel(
          id: old.id,
          userId: old.userId,
          title: old.title,
          message: old.message,
          type: old.type,
          timestamp: old.timestamp,
          isRead: true,
          imageUrl: old.imageUrl,
          relatedId: old.relatedId,
          data: old.data,
        );
        _updateUnreadCount();
        notifyListeners();
        print('✅ Notification marked as read locally');
      }
    } catch (e) {
      print('❌ Error marking as read: $e');
    }
  }

  // ✅ Mark all as read
  void markAllAsRead() async {
    try {
      print('📖 Marking all notifications as read...');
      await NotificationApiService.markAllAsRead();
      
      for (int i = 0; i < _notifications.length; i++) {
        final old = _notifications[i];
        _notifications[i] = NotificationModel(
          id: old.id,
          userId: old.userId,
          title: old.title,
          message: old.message,
          type: old.type,
          timestamp: old.timestamp,
          isRead: true,
          imageUrl: old.imageUrl,
          relatedId: old.relatedId,
          data: old.data,
        );
      }
      _updateUnreadCount();
      notifyListeners();
      print('✅ All notifications marked as read');
    } catch (e) {
      print('❌ Error marking all as read: $e');
    }
  }

  // ✅ Add new notification (with sound)
  Future<void> addNotification({
    required String title,
    required String message,
    String type = 'general',
    String? imageUrl,
    String? id,
    String? relatedId,
  }) async {
    print('🔔 Adding new notification: $title');
    print('🔔 Message: $message');
    
    final newNotification = NotificationModel(
      id: id ?? DateTime.now().millisecondsSinceEpoch.toString(),
      userId: '',
      title: title,
      message: message,
      type: type,
      timestamp: DateTime.now(),
      isRead: false,
      imageUrl: imageUrl,
      relatedId: relatedId,
      data: {},
    );

    _notifications.insert(0, newNotification);
    _updateUnreadCount();
    notifyListeners();

    // ✅ Play sound and show system notification
    try {
      await NotificationService.showNotification(
        title: title,
        body: message,
        payload: newNotification.id,
      );
      print('✅ Sound played and notification shown');
    } catch (e) {
      print('❌ Error playing sound: $e');
    }
  }

  // ✅ Remove notification
  void removeNotification(String id) async {
    try {
      print('🗑️ Removing notification: $id');
      await NotificationApiService.deleteNotification(id);
      
      _notifications.removeWhere((n) => n.id == id);
      _updateUnreadCount();
      notifyListeners();
      print('✅ Notification removed');
    } catch (e) {
      print('❌ Error removing notification: $e');
    }
  }

  // ✅ Clear all notifications
  void clearAll() async {
    try {
      print('🗑️ Clearing all notifications...');
      await NotificationApiService.deleteAllNotifications();
      
      _notifications.clear();
      _unreadCount = 0;
      notifyListeners();
      print('✅ All notifications cleared');
    } catch (e) {
      print('❌ Error clearing all: $e');
    }
  }

  // ✅ Refresh notifications
  Future<void> refresh() async {
    print('🔄 Refreshing notifications...');
    await fetchNotifications();
  }

  // ✅ Force update unread count
  Future<void> updateUnreadCount() async {
    try {
      final count = await NotificationApiService.getUnreadCount();
      if (count != _unreadCount) {
        _unreadCount = count;
        notifyListeners();
        print('📊 Updated unread count: $_unreadCount');
      }
    } catch (e) {
      print('❌ Error updating unread count: $e');
    }
  }
}