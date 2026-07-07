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
    // Initialize and fetch notifications
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
      print('📊 Total notifications: ${response['notifications']?.length ?? 0}');
      print('📊 Unread count: ${response['unreadCount'] ?? 0}');

      if (response['success'] == true) {
        final List<dynamic> notificationData = response['notifications'] ?? [];
        
        _notifications = notificationData
            .map((n) => NotificationModel.fromJson(n))
            .toList();
        
        _unreadCount = response['unreadCount'] ?? 0;
        
        print('✅ Loaded ${_notifications.length} notifications');
        print('✅ Unread count: $_unreadCount');
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

  // ✅ Load dummy notifications (Fallback)
  void _loadDummyNotifications() {
    print('📱 Loading dummy notifications...');
    _notifications = [
      NotificationModel(
        id: '1',
        title: '🎉 Welcome to SeaSoul!',
        message: 'Explore the pristine islands of Lakshadweep with us.',
        type: 'general',
        timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
        isRead: false,
        imageUrl: null,
      ),
      NotificationModel(
        id: '2',
        title: '📅 Booking Confirmed',
        message: 'Your Luxury Beach Resort booking has been confirmed.',
        type: 'booking',
        timestamp: DateTime.now().subtract(const Duration(hours: 2)),
        isRead: false,
      ),
      NotificationModel(
        id: '3',
        title: '🌟 New Activity Added',
        message: 'Try our new Sunset Kayaking experience at Agatti Island!',
        type: 'activity',
        timestamp: DateTime.now().subtract(const Duration(hours: 5)),
        isRead: false,
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
        _notifications[index] = NotificationModel(
          id: _notifications[index].id,
          title: _notifications[index].title,
          message: _notifications[index].message,
          type: _notifications[index].type,
          timestamp: _notifications[index].timestamp,
          isRead: true,
          imageUrl: _notifications[index].imageUrl,
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
        _notifications[i] = NotificationModel(
          id: _notifications[i].id,
          title: _notifications[i].title,
          message: _notifications[i].message,
          type: _notifications[i].type,
          timestamp: _notifications[i].timestamp,
          isRead: true,
          imageUrl: _notifications[i].imageUrl,
        );
      }
      _updateUnreadCount();
      notifyListeners();
      print('✅ All notifications marked as read');
    } catch (e) {
      print('❌ Error marking all as read: $e');
    }
  }

  // ✅ Add new notification (with sound) - Called from backend
  Future<void> addNotification({
    required String title,
    required String message,
    String type = 'general',
    String? imageUrl,
    String? id,
  }) async {
    print('🔔 Adding new notification: $title');
    print('🔔 Message: $message');
    
    final newNotification = NotificationModel(
      id: id ?? DateTime.now().millisecondsSinceEpoch.toString(),
      title: title,
      message: message,
      type: type,
      timestamp: DateTime.now(),
      isRead: false,
      imageUrl: imageUrl,
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