import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class WishlistService {
  static const String _wishlistKey = 'wishlist_items';
  
  // ✅ Added: Stream controller for real-time updates
  static final List<Function(List<dynamic>)> _listeners = [];

  // Get all wishlist items
  static Future<List<dynamic>> getWishlist() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? wishlistString = prefs.getString(_wishlistKey);
      if (wishlistString != null && wishlistString.isNotEmpty) {
        return jsonDecode(wishlistString);
      }
      return [];
    } catch (e) {
      print('❌ Error getting wishlist: $e');
      return [];
    }
  }

  // Add item to wishlist
  static Future<void> addToWishlist(Map<String, dynamic> item) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      List<dynamic> wishlist = await getWishlist();
      
      bool exists = wishlist.any((i) => i['id'] == item['id']);
      if (!exists) {
        wishlist.add(item);
        await prefs.setString(_wishlistKey, jsonEncode(wishlist));
        print('✅ Added to wishlist: ${item['name']}');
        
        // ✅ Notify all listeners
        _notifyListeners(wishlist);
      }
    } catch (e) {
      print('❌ Error adding to wishlist: $e');
      rethrow;
    }
  }

  // Remove item from wishlist
  static Future<void> removeFromWishlist(String id) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      List<dynamic> wishlist = await getWishlist();
      
      wishlist.removeWhere((item) => item['id'] == id);
      await prefs.setString(_wishlistKey, jsonEncode(wishlist));
      print('✅ Removed from wishlist: $id');
      
      // ✅ Notify all listeners
      _notifyListeners(wishlist);
    } catch (e) {
      print('❌ Error removing from wishlist: $e');
      rethrow;
    }
  }

  // Check if item is in wishlist
  static Future<bool> isInWishlist(String id) async {
    try {
      final wishlist = await getWishlist();
      return wishlist.any((item) => item['id'] == id);
    } catch (e) {
      print('❌ Error checking wishlist: $e');
      return false;
    }
  }

  // Clear wishlist
  static Future<void> clearWishlist() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_wishlistKey);
      print('✅ Wishlist cleared');
      
      // ✅ Notify all listeners
      _notifyListeners([]);
    } catch (e) {
      print('❌ Error clearing wishlist: $e');
      rethrow;
    }
  }

  // ✅ Add listener
  static void addListener(Function(List<dynamic>) listener) {
    _listeners.add(listener);
  }

  // ✅ Remove listener
  static void removeListener(Function(List<dynamic>) listener) {
    _listeners.remove(listener);
  }

  // ✅ Notify all listeners
  static void _notifyListeners(List<dynamic> wishlist) {
    for (var listener in _listeners) {
      listener(wishlist);
    }
  }
}