import 'package:flutter/material.dart';
import '../models/notification_model.dart';
import '../services/notification_service.dart';
import '../services/notification_api_service.dart';

class NotificationProvider extends ChangeNotifier {
  List<NotificationModel> _notifications = [];
  bool _isLoading = false;
  int _unreadCount = 0;

  List<NotificationModel> get notifications => _notifications;
  bool get isLoading => _isLoading;
  int get unreadCount => _unreadCount;

  NotificationProvider() {
    fetchNotifications();
  }

  // ✅ Fetch notifications from API
  Future<void> fetchNotifications() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await NotificationApiService.getNotifications();
      if (response['success'] == true) {
        _notifications = (response['notifications'] as List)
            .map((n) => NotificationModel.fromJson(n))
            .toList();
        _unreadCount = response['unreadCount'] ?? 0;
      }
    } catch (e) {
      print('❌ Error fetching notifications: $e');
      // Fallback to dummy data if API fails
      _loadDummyNotifications();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // ✅ Load dummy notifications (Fallback)
  void _loadDummyNotifications() {
    _notifications = [
      NotificationModel(
        id: '1',
        title: '🎉 New Offer!',
        message: 'Get 20% off on all scuba diving packages this weekend!',
        type: 'promotion',
        timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
        isRead: false,
        imageUrl: 'https://via.placeholder.com/50',
      ),
      NotificationModel(
        id: '2',
        title: '📅 Booking Confirmed',
        message: 'Your Luxury Beach Resort booking has been confirmed for Oct 15-20.',
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
    _updateUnreadCount();
  }

  void _updateUnreadCount() {
    _unreadCount = _notifications.where((n) => !n.isRead).length;
    notifyListeners();
  }

  // ✅ Mark as read
  void markAsRead(String id) async {
    try {
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
      }
    } catch (e) {
      print('❌ Error marking as read: $e');
    }
  }

  // ✅ Mark all as read
  void markAllAsRead() async {
    try {
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
  }) async {
    final newNotification = NotificationModel(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
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

    // ✅ Show system notification with sound
    await NotificationService.showNotification(
      title: title,
      body: message,
      payload: newNotification.id,
    );
  }

  // ✅ Remove notification
  void removeNotification(String id) async {
    try {
      await NotificationApiService.deleteNotification(id);
      
      _notifications.removeWhere((n) => n.id == id);
      _updateUnreadCount();
      notifyListeners();
    } catch (e) {
      print('❌ Error removing notification: $e');
    }
  }

  // ✅ Clear all notifications
  void clearAll() async {
    try {
      await NotificationApiService.deleteAllNotifications();
      
      _notifications.clear();
      _unreadCount = 0;
      notifyListeners();
    } catch (e) {
      print('❌ Error clearing all: $e');
    }
  }

  // ✅ Refresh notifications
  Future<void> refresh() async {
    await fetchNotifications();
  }
}