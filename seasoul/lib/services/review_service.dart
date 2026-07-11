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

      final response = await ApiService.postWithToken(
        '${ApiConstants.baseUrl}/api/reviews',
        data,
      );
      
      if (response is Map<String, dynamic>) {
        return response;
      }
      return {'success': false, 'message': 'Invalid response format'};
    } catch (e) {
      print('❌ Error creating review: $e');
      return {'success': false, 'message': e.toString()};
    }
  }

  // ✅ Get reviews for an item - RETURNS Map with reviews list
  static Future<Map<String, dynamic>> getItemReviews({
    required String itemId,
    required String itemType,
    int limit = 10,
    int offset = 0,
  }) async {
    try {
      final url = '${ApiConstants.baseUrl}/api/reviews/item/$itemType/$itemId?limit=$limit&offset=$offset';
      final response = await ApiService.get(url);
      
      if (response is Map<String, dynamic>) {
        // ✅ Keep reviews as List<dynamic> (not List<ReviewModel>)
        // Let the caller handle the conversion
        return response;
      }
      return {
        'success': false, 
        'message': 'Invalid response format',
        'reviews': [],
        'averageRating': 0.0,
        'totalReviews': 0,
      };
    } catch (e) {
      print('❌ Error getting reviews: $e');
      return {
        'success': false, 
        'message': e.toString(),
        'reviews': [],
        'averageRating': 0.0,
        'totalReviews': 0,
      };
    }
  }

  // ✅ Get user's reviews
  static Future<Map<String, dynamic>> getUserReviews() async {
    try {
      final response = await ApiService.getWithToken(
        '${ApiConstants.baseUrl}/api/reviews/user'
      );
      
      if (response is Map<String, dynamic>) {
        return response;
      }
      return {'success': false, 'message': 'Invalid response format'};
    } catch (e) {
      print('❌ Error getting user reviews: $e');
      return {'success': false, 'message': e.toString()};
    }
  }

  // ✅ Get single review
  static Future<Map<String, dynamic>> getReviewById(String reviewId) async {
    try {
      final response = await ApiService.getWithToken(
        '${ApiConstants.baseUrl}/api/reviews/$reviewId'
      );
      
      if (response is Map<String, dynamic>) {
        return response;
      }
      return {'success': false, 'message': 'Invalid response format'};
    } catch (e) {
      print('❌ Error getting review: $e');
      return {'success': false, 'message': e.toString()};
    }
  }

  // ✅ Update review
  static Future<Map<String, dynamic>> updateReview({
    required String reviewId,
    required double rating,
    required String title,
    required String comment,
    List<String>? images,
  }) async {
    try {
      final data = {
        'rating': rating,
        'title': title,
        'comment': comment,
        if (images != null) 'images': images,
      };

      final response = await ApiService.putWithToken(
        '${ApiConstants.baseUrl}/api/reviews/$reviewId',
        data,
      );
      
      if (response is Map<String, dynamic>) {
        return response;
      }
      return {'success': false, 'message': 'Invalid response format'};
    } catch (e) {
      print('❌ Error updating review: $e');
      return {'success': false, 'message': e.toString()};
    }
  }

  // ✅ Delete review
  static Future<Map<String, dynamic>> deleteReview(String reviewId) async {
    try {
      final response = await ApiService.deleteWithToken(
        '${ApiConstants.baseUrl}/api/reviews/$reviewId'
      );
      
      if (response is Map<String, dynamic>) {
        return response;
      }
      return {'success': false, 'message': 'Invalid response format'};
    } catch (e) {
      print('❌ Error deleting review: $e');
      return {'success': false, 'message': e.toString()};
    }
  }

  // ✅ Toggle helpful
  static Future<Map<String, dynamic>> toggleHelpful(String reviewId) async {
    try {
      final response = await ApiService.putWithToken(
        '${ApiConstants.baseUrl}/api/reviews/$reviewId/helpful',
        {},
      );
      
      if (response is Map<String, dynamic>) {
        return response;
      }
      return {'success': false, 'message': 'Invalid response format'};
    } catch (e) {
      print('❌ Error toggling helpful: $e');
      return {'success': false, 'message': e.toString()};
    }
  }

  // ✅ Get recent reviews for home page
  static Future<Map<String, dynamic>> getRecentReviews({int limit = 3}) async {
    try {
      final url = '${ApiConstants.baseUrl}/api/reviews/recent?limit=$limit';
      final response = await ApiService.get(url);
      
      if (response is Map<String, dynamic>) {
        return response;
      }
      return {
        'success': false, 
        'message': 'Invalid response format',
        'reviews': [],
      };
    } catch (e) {
      print('❌ Error getting recent reviews: $e');
      return {'success': false, 'message': e.toString(), 'reviews': []};
    }
  }

  // ✅ Get review as model
  static Future<ReviewModel?> getReviewAsModel(String reviewId) async {
    try {
      final response = await getReviewById(reviewId);
      if (response['success'] == true && response['review'] != null) {
        final reviewData = response['review'];
        if (reviewData is Map<String, dynamic>) {
          return ReviewModel.fromJson(reviewData);
        }
      }
      return null;
    } catch (e) {
      print('❌ Error getting review as model: $e');
      return null;
    }
  }
}