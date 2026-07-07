import 'package:seasoul/services/api_service.dart';
import 'package:seasoul/constants/api_constants.dart';
import '../models/notification_model.dart';

class NotificationApiService {
  // ✅ Get all notifications
  static Future<Map<String, dynamic>> getNotifications({
    int limit = 50,
    int offset = 0,
    bool unreadOnly = false,
  }) async {
    try {
      String url = '${ApiConstants.baseUrl}/api/notifications?limit=$limit&offset=$offset';
      if (unreadOnly) {
        url += '&unreadOnly=true';
      }
      return await ApiService.get(url);
    } catch (e) {
      print('❌ Error fetching notifications: $e');
      rethrow;
    }
  }

  // ✅ Get unread count
  static Future<int> getUnreadCount() async {
    try {
      final response = await ApiService.get(
        '${ApiConstants.baseUrl}/api/notifications/unread-count'
      );
      return response['unreadCount'] ?? 0;
    } catch (e) {
      print('❌ Error getting unread count: $e');
      return 0;
    }
  }

  // ✅ Mark notification as read
  static Future<Map<String, dynamic>> markAsRead(String id) async {
    try {
      return await ApiService.put(
        '${ApiConstants.baseUrl}/api/notifications/$id/read',
        {},
      );
    } catch (e) {
      print('❌ Error marking notification as read: $e');
      rethrow;
    }
  }

  // ✅ Mark all as read
  static Future<Map<String, dynamic>> markAllAsRead() async {
    try {
      return await ApiService.put(
        '${ApiConstants.baseUrl}/api/notifications/read-all',
        {},
      );
    } catch (e) {
      print('❌ Error marking all as read: $e');
      rethrow;
    }
  }

  // ✅ Delete notification
  static Future<Map<String, dynamic>> deleteNotification(String id) async {
    try {
      return await ApiService.delete(
        '${ApiConstants.baseUrl}/api/notifications/$id'
      );
    } catch (e) {
      print('❌ Error deleting notification: $e');
      rethrow;
    }
  }

  // ✅ Delete all notifications
  static Future<Map<String, dynamic>> deleteAllNotifications() async {
    try {
      return await ApiService.delete(
        '${ApiConstants.baseUrl}/api/notifications'
      );
    } catch (e) {
      print('❌ Error deleting all notifications: $e');
      rethrow;
    }
  }
}