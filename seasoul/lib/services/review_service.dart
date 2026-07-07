import 'package:seasoul/services/api_service.dart';
import 'package:seasoul/constants/api_constants.dart';
import '../models/review_model.dart';

class ReviewService {
  // ✅ Create review
  static Future<Map<String, dynamic>> createReview({
    required String bookingId,
    required double rating,
    required String title,
    required String comment,
    String? productId,
    String? activityId,
    List<String>? images,
  }) async {
    try {
      final data = {
        'bookingId': bookingId,
        'rating': rating,
        'title': title,
        'comment': comment,
        if (productId != null) 'productId': productId,
        if (activityId != null) 'activityId': activityId,
        if (images != null) 'images': images,
      };

      return await ApiService.postWithToken(
        '${ApiConstants.baseUrl}/api/reviews',
        data,
      );
    } catch (e) {
      print('❌ Error creating review: $e');
      rethrow;
    }
  }

  // ✅ Get reviews for an item
  static Future<Map<String, dynamic>> getItemReviews({
    required String itemId,
    required String itemType,
    int limit = 10,
    int offset = 0,
  }) async {
    try {
      final url = '${ApiConstants.baseUrl}/api/reviews/item/$itemType/$itemId?limit=$limit&offset=$offset';
      return await ApiService.get(url);
    } catch (e) {
      print('❌ Error getting reviews: $e');
      rethrow;
    }
  }

  // ✅ Get user's reviews
  static Future<Map<String, dynamic>> getUserReviews() async {
    try {
      return await ApiService.getWithToken(
        '${ApiConstants.baseUrl}/api/reviews/user'
      );
    } catch (e) {
      print('❌ Error getting user reviews: $e');
      rethrow;
    }
  }

  // ✅ Toggle helpful
  static Future<Map<String, dynamic>> toggleHelpful(String reviewId) async {
    try {
      return await ApiService.putWithToken(
        '${ApiConstants.baseUrl}/api/reviews/$reviewId/helpful',
        {},
      );
    } catch (e) {
      print('❌ Error toggling helpful: $e');
      rethrow;
    }
  }

  // ✅ Delete review
  static Future<Map<String, dynamic>> deleteReview(String reviewId) async {
    try {
      return await ApiService.deleteWithToken(
        '${ApiConstants.baseUrl}/api/reviews/$reviewId'
      );
    } catch (e) {
      print('❌ Error deleting review: $e');
      rethrow;
    }
  }

  // ✅ Get recent reviews for home page
  static Future<Map<String, dynamic>> getRecentReviews({int limit = 3}) async {
    try {
      final url = '${ApiConstants.baseUrl}/api/reviews/recent?limit=$limit';
      return await ApiService.get(url);
    } catch (e) {
      print('❌ Error getting recent reviews: $e');
      rethrow;
    }
  }
}

