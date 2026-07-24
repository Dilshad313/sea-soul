import 'package:flutter/material.dart';

class IconHelper {
  // ✅ Only icons that are guaranteed to exist in all Flutter versions
  static const Map<String, IconData> _materialIcons = {
    // Home & Accommodation
    'home': Icons.home,
    'home_work': Icons.home_work,
    'home_repair_service': Icons.home_repair_service,
    'house': Icons.house,
    'house_outlined': Icons.house_outlined,
    'cottage': Icons.cottage,
    'cottage_outlined': Icons.cottage_outlined,
    'cabin': Icons.cabin,
    'bed': Icons.bed,
    'bed_outlined': Icons.bed_outlined,
    'hotel': Icons.hotel,
    'villa': Icons.villa,
    'apartment': Icons.apartment,
    'family_restroom': Icons.family_restroom,
    'holiday_village': Icons.holiday_village,
    'hiking': Icons.hiking,
    
    // Transportation
    'car_rental': Icons.car_rental,
    'electric_car': Icons.electric_car,
    'moped': Icons.moped,
    'electric_moped': Icons.electric_moped,
    'motorcycle': Icons.motorcycle,
    'directions_bike': Icons.directions_bike,
    'directions_car': Icons.directions_car,
    'two_wheeler': Icons.two_wheeler,
    'directions_bus': Icons.directions_bus,
    'train': Icons.train,
    'flight': Icons.flight,
    'flight_takeoff': Icons.flight_takeoff,
    'directions_boat': Icons.directions_boat,
    'sailing': Icons.sailing,
    
    // Water Sports & Activities
    'scuba_diving': Icons.scuba_diving,
    'surfing': Icons.surfing,
    'kayaking': Icons.kayaking,
    'snowboarding': Icons.snowboarding,
    'pool': Icons.pool,
    'water': Icons.water,
    'waves': Icons.waves,
    'beach_access': Icons.beach_access,
    
    // Food & Dining
    'restaurant': Icons.restaurant,
    'restaurant_menu': Icons.restaurant_menu,
    'ramen_dining': Icons.ramen_dining,
    'dinner_dining': Icons.dinner_dining,
    'lunch_dining': Icons.lunch_dining,
    'breakfast_dining': Icons.breakfast_dining,
    'brunch_dining': Icons.brunch_dining,
    'fastfood': Icons.fastfood,
    'food_bank': Icons.food_bank,
    'room_service': Icons.room_service,
    'free_breakfast': Icons.free_breakfast,
    
    // Shopping & Products
    'shopping_bag': Icons.shopping_bag,
    'shopping_cart': Icons.shopping_cart,
    'local_mall': Icons.local_mall,
    'storefront': Icons.storefront,
    'store': Icons.store,
    'shop': Icons.shop,
    'local_offer': Icons.local_offer,
    'card_giftcard': Icons.card_giftcard,
    'design_services': Icons.design_services,
    'biotech': Icons.biotech,
    'art_track': Icons.art_track,
    'inventory': Icons.inventory,
    'local_shipping': Icons.local_shipping,
    'delivery_dining': Icons.delivery_dining,
    'cleaning_services': Icons.cleaning_services,
    'handmade': Icons.handyman, // Using handyman as closest match
    'package': Icons.inventory, // Using inventory as closest match
    'tent': Icons.cabin, // Using cabin as closest match
    'compass': Icons.explore, // Using explore as closest match
    'camping': Icons.park, // Using park as closest match
    'palmtree': Icons.park, // Using park as closest match
    'flower': Icons.local_florist,
    'butterfly': Icons.catching_pokemon, // Closest match available
    'island': Icons.landscape,
    'bath': Icons.bathtub,
    'walking': Icons.directions_walk,
    'beach_umbrella': Icons.beach_access,
    'explore': Icons.explore,
    'category': Icons.category,
    
    // Events & Entertainment
    'event': Icons.event,
    'event_available': Icons.event_available,
    'celebration': Icons.celebration,
    'music_note': Icons.music_note,
    'music_off': Icons.music_off,
    'theaters': Icons.theaters,
    'movie': Icons.movie,
    'sports': Icons.sports,
    'sports_baseball': Icons.sports_baseball,
    'sports_basketball': Icons.sports_basketball,
    'sports_cricket': Icons.sports_cricket,
    'sports_football': Icons.sports_football,
    'sports_tennis': Icons.sports_tennis,
    'sports_volleyball': Icons.sports_volleyball,
    
    // Nature & Travel
    'nature': Icons.nature,
    'nature_people': Icons.nature_people,
    'park': Icons.park,
    'forest': Icons.forest,
    'grass': Icons.grass,
    'terrain': Icons.terrain,
    'landscape': Icons.landscape,
    
    // Activities
    'directions_run': Icons.directions_run,
    'fitness_center': Icons.fitness_center,
    'golf_course': Icons.golf_course,
    'luggage': Icons.luggage,
    'backpack': Icons.backpack,
    'map': Icons.map,
    'location_on': Icons.location_on,
    'push_pin': Icons.push_pin,
    'flag': Icons.flag,
    'camera_alt': Icons.camera_alt,
    'photo': Icons.photo,
    'image': Icons.image,
    'settings': Icons.settings,
    'build': Icons.build,
    'handyman': Icons.handyman,
    'star': Icons.star,
    'favorite': Icons.favorite,
    
    // ✅ Additional safe icons
    'emoji_emotions': Icons.emoji_emotions,
    'sports_soccer': Icons.sports_soccer,
    
    // Default fallback
    'default': Icons.category,
  };

  /// Get IconData from icon name
  static IconData getIconData(String iconName) {
    return _materialIcons[iconName] ?? _materialIcons['default']!;
  }

  /// Build an icon widget with color
  static Widget buildIcon(String iconName, {double size = 28, Color? color}) {
    final iconData = getIconData(iconName);
    return Icon(iconData, size: size, color: color);
  }

  /// Get all available icon names with their display names
  static List<Map<String, String>> getAvailableIcons() {
    final List<String> keys = _materialIcons.keys.toList();
    keys.remove('default');
    
    return keys.map((key) {
      String displayName = key
          .replaceAll('_', ' ')
          .split(' ')
          .map((word) {
            if (word.isEmpty) return '';
            return word[0].toUpperCase() + word.substring(1);
          })
          .join(' ');
      return {
        'name': key,
        'displayName': displayName,
      };
    }).toList();
  }

  /// Get icon preview widget
  static Widget getIconPreview(String iconName, {double size = 24, Color? color}) {
    final iconData = getIconData(iconName);
    return Icon(iconData, size: size, color: color ?? Colors.black);
  }

  /// Check if icon name exists
  static bool iconExists(String iconName) {
    return _materialIcons.containsKey(iconName);
  }
}