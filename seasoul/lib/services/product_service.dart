import '../../services/api_service.dart';
import '../../constants/api_constants.dart';

class ProductService {
  static Future<Map<String, dynamic>> getProducts({
    String? sort,
    String? category,
    String? search,
    int? limit,
  }) async {
    try {
      String url = ApiConstants.products;
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
      print('❌ Error fetching products: $e');
      rethrow;
    }
  }
  
  static Future<Map<String, dynamic>> getFeaturedProducts() async {
    try {
      return await ApiService.get(ApiConstants.featuredProducts);
    } catch (e) {
      print('❌ Error fetching featured products: $e');
      rethrow;
    }
  }
  
  static Future<Map<String, dynamic>> getTrendingProducts() async {
    try {
      return await ApiService.get(ApiConstants.trendingProducts);
    } catch (e) {
      print('❌ Error fetching trending products: $e');
      rethrow;
    }
  }
  
  static Future<Map<String, dynamic>> getProductById(String id) async {
    try {
      return await ApiService.get(ApiConstants.productById(id));
    } catch (e) {
      print('❌ Error fetching product: $e');
      rethrow;
    }
  }
  
  static Future<Map<String, dynamic>> getProductsByCategory(String category) async {
    try {
      return await ApiService.get(ApiConstants.productsByCategory(category));
    } catch (e) {
      print('❌ Error fetching products by category: $e');
      rethrow;
    }
  }
}