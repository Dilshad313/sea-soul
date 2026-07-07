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
      print('📱 API: Getting notifications...');
      String url = '${ApiConstants.baseUrl}/api/notifications?limit=$limit&offset=$offset';
      if (unreadOnly) {
        url += '&unreadOnly=true';
      }
      print('📱 URL: $url');
      
      final response = await ApiService.get(url);
      print('📥 API Response: ${response['success']}');
      return response;
    } catch (e) {
      print('❌ Error fetching notifications: $e');
      rethrow;
    }
  }

  // ✅ Get unread count
  static Future<int> getUnreadCount() async {
    try {
      print('📱 API: Getting unread count...');
      final response = await ApiService.get(
        '${ApiConstants.baseUrl}/api/notifications/unread-count'
      );
      final count = response['unreadCount'] ?? 0;
      print('📊 Unread count: $count');
      return count;
    } catch (e) {
      print('❌ Error getting unread count: $e');
      return 0;
    }
  }

  // ✅ Mark notification as read
  static Future<Map<String, dynamic>> markAsRead(String id) async {
    try {
      print('📱 API: Marking as read: $id');
      final response = await ApiService.put(
        '${ApiConstants.baseUrl}/api/notifications/$id/read',
        {},
      );
      return response;
    } catch (e) {
      print('❌ Error marking notification as read: $e');
      rethrow;
    }
  }

  // ✅ Mark all as read
  static Future<Map<String, dynamic>> markAllAsRead() async {
    try {
      print('📱 API: Marking all as read...');
      final response = await ApiService.put(
        '${ApiConstants.baseUrl}/api/notifications/read-all',
        {},
      );
      return response;
    } catch (e) {
      print('❌ Error marking all as read: $e');
      rethrow;
    }
  }

  // ✅ Delete notification
  static Future<Map<String, dynamic>> deleteNotification(String id) async {
    try {
      print('📱 API: Deleting notification: $id');
      final response = await ApiService.delete(
        '${ApiConstants.baseUrl}/api/notifications/$id'
      );
      return response;
    } catch (e) {
      print('❌ Error deleting notification: $e');
      rethrow;
    }
  }

  // ✅ Delete all notifications
  static Future<Map<String, dynamic>> deleteAllNotifications() async {
    try {
      print('📱 API: Deleting all notifications...');
      final response = await ApiService.delete(
        '${ApiConstants.baseUrl}/api/notifications'
      );
      return response;
    } catch (e) {
      print('❌ Error deleting all notifications: $e');
      rethrow;
    }
  }
}