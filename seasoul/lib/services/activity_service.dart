import '../services/api_service.dart';
import '../constants/api_constants.dart';

class ActivityService {
  static Future<Map<String, dynamic>> getActivities({
    String? sort,
    String? category,
    String? search,
    int? limit,
  }) async {
    try {
      String url = ApiConstants.activities;
      List<String> params = [];
      
      if (sort != null && sort.isNotEmpty) params.add('sort=$sort');
      if (category != null && category.isNotEmpty && category != 'All') params.add('category=$category');
      if (search != null && search.isNotEmpty) params.add('search=$search');
      if (limit != null) params.add('limit=$limit');
      
      if (params.isNotEmpty) {
        url += '?' + params.join('&');
      }
      
      return await ApiService.get(url);
    } catch (e) {
      print('❌ Error fe tching activities: $e');
      rethrow;
    }
  }
  
  static Future<Map<String, dynamic>> getFeaturedActivities() async {
    try {
      return await ApiService.get(ApiConstants.featuredActivities);
    } catch (e) {
      print('❌ Error fetching featured activities: $e');
      rethrow;
    }
  }
  
  static Future<Map<String, dynamic>> getTrendingActivities() async {
    try {
      return await ApiService.get(ApiConstants.trendingActivities);
    } catch (e) {
      print('❌ Error fetching trending activities: $e');
      rethrow;
    }
  }
  
  static Future<Map<String, dynamic>> getActivityById(String id) async {
    try {
      return await ApiService.get(ApiConstants.activityById(id));
    } catch (e) {
      print('❌ Error fetching activity: $e');
      rethrow;
    }
  }
  
  static Future<Map<String, dynamic>> getActivitiesByCategory(String category) async {
    try {
      return await ApiService.get(ApiConstants.activitiesByCategory(category));
    } catch (e) {
      print('❌ Error fetching activities by category: $e');
      rethrow;
    }
  }
}