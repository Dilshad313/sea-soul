import 'package:seasoul/services/api_service.dart';
import 'package:seasoul/constants/api_constants.dart';
import 'package:seasoul/models/category_model.dart';

class CategoryService {
  /// Fetch all categories from backend
  static Future<List<CategoryModel>> getCategories() async {
    try {
      final response = await ApiService.get(ApiConstants.categories);
      if (response['success'] == true) {
        final List<dynamic> data = response['categories'] ?? [];
        return data
            .map((json) => CategoryModel.fromJson(json))
            .where((cat) => cat.isActive) // Only active categories
            .toList()
          ..sort((a, b) {
            // Sort by sortOrder, then by name
            if (a.sortOrder != b.sortOrder) {
              return a.sortOrder.compareTo(b.sortOrder);
            }
            return a.name.compareTo(b.name);
          });
      }
      return [];
    } catch (e) {
      print('❌ Error fetching categories: $e');
      return [];
    }
  }

  /// Get only category names as list (for explore page chips)
  static Future<List<String>> getCategoryNames() async {
    final categories = await getCategories();
    return categories.map((cat) => cat.name).toList();
  }
}