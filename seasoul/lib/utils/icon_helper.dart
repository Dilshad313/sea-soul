import 'package:flutter/material.dart';

class IconHelper {
  // ✅ Comprehensive Material Icons mapping - ALL VALID ICONS
  static const Map<String, IconData> _materialIcons = {
    // Home & Accommodation
    'home': Icons.home,
    'home_work': Icons.home_work,
    'home_repair_service': Icons.home_repair_service,
    'house': Icons.house,
    'cottage': Icons.cottage,
    'cabin': Icons.cabin,
    'bed': Icons.bed,
    'hotel': Icons.hotel,
    'villa': Icons.villa,
    'apartment': Icons.apartment,
    'night_shelter': Icons.night_shelter,
    'holiday_village': Icons.holiday_village,
    'bungalow': Icons.bungalow,
    'roofing': Icons.roofing,
    'king_bed': Icons.king_bed,
    'single_bed': Icons.single_bed,
    
    // Transportation
    'car_rental': Icons.car_rental,
    'electric_car': Icons.electric_car,
    'moped': Icons.moped,
    'electric_moped': Icons.electric_moped,
    'motorcycle': Icons.motorcycle,
    'electric_bike': Icons.electric_bike,
    'pedal_bike': Icons.pedal_bike,
    'directions_bike': Icons.directions_bike,
    'directions_car': Icons.directions_car,
    'two_wheeler': Icons.two_wheeler,
    'airport_shuttle': Icons.airport_shuttle,
    'directions_bus': Icons.directions_bus,
    'train': Icons.train,
    'tram': Icons.tram,
    'subway': Icons.subway,
    'flight': Icons.flight,
    'flight_takeoff': Icons.flight_takeoff,
    'flight_land': Icons.flight_land,
    'directions_boat': Icons.directions_boat,
    'sailing': Icons.sailing,
    'paragliding': Icons.paragliding,
    
    // Water Sports & Beach
    'scuba_diving': Icons.scuba_diving,
    'surfing': Icons.surfing,
    'kayaking': Icons.kayaking,
    'pool': Icons.pool,
    'water': Icons.water,
    'waves': Icons.waves,
    'beach_access': Icons.beach_access,
    'umbrella': Icons.umbrella,
    'water_drop': Icons.water_drop,
    
    // Winter & Snow Sports
    'snowboarding': Icons.snowboarding,
    'downhill_skiing': Icons.downhill_skiing,
    'ac_unit': Icons.ac_unit,
    
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
    'local_cafe': Icons.local_cafe,
    'local_bar': Icons.local_bar,
    'local_pizza': Icons.local_pizza,
    'icecream': Icons.icecream,
    'cake': Icons.cake,
    'coffee': Icons.coffee,
    'wine_bar': Icons.wine_bar,
    'liquor': Icons.liquor,
    'tapas': Icons.tapas,
    'egg': Icons.egg,
    'set_meal': Icons.set_meal,
    'soup_kitchen': Icons.soup_kitchen,
    
    // Shopping & Products
    'shopping_bag': Icons.shopping_bag,
    'shopping_cart': Icons.shopping_cart,
    'local_mall': Icons.local_mall,
    'storefront': Icons.storefront,
    'store': Icons.store,
    'local_convenience_store': Icons.local_convenience_store,
    'local_grocery_store': Icons.local_grocery_store,
    'local_offer': Icons.local_offer,
    'card_giftcard': Icons.card_giftcard,
    'redeem': Icons.redeem,
    'checkroom': Icons.checkroom,
    'handyman': Icons.handyman,
    'build': Icons.build,
    'construction': Icons.construction,
    'design_services': Icons.design_services,
    'palette': Icons.palette,
    'brush': Icons.brush,
    'auto_awesome': Icons.auto_awesome,
    
    // Events & Entertainment
    'event': Icons.event,
    'event_available': Icons.event_available,
    'celebration': Icons.celebration,
    'festival': Icons.festival,
    'party_mode': Icons.party_mode,
    'music_note': Icons.music_note,
    'audiotrack': Icons.audiotrack,
    'headphones': Icons.headphones,
    'piano': Icons.piano,
    'theaters': Icons.theaters,
    'movie': Icons.movie,
    'local_movies': Icons.local_movies,
    'video_library': Icons.video_library,
    'live_tv': Icons.live_tv,
    'casino': Icons.casino,
    'attractions': Icons.attractions,
    
    // Sports & Fitness
    'sports': Icons.sports,
    'sports_baseball': Icons.sports_baseball,
    'sports_basketball': Icons.sports_basketball,
    'sports_cricket': Icons.sports_cricket,
    'sports_football': Icons.sports_football,
    'sports_soccer': Icons.sports_soccer,
    'sports_tennis': Icons.sports_tennis,
    'sports_volleyball': Icons.sports_volleyball,
    'sports_golf': Icons.sports_golf,
    'sports_hockey': Icons.sports_hockey,
    'sports_rugby': Icons.sports_rugby,
    'sports_handball': Icons.sports_handball,
    'sports_kabaddi': Icons.sports_kabaddi,
    'sports_martial_arts': Icons.sports_martial_arts,
    'sports_mma': Icons.sports_mma,
    'sports_gymnastics': Icons.sports_gymnastics,
    'fitness_center': Icons.fitness_center,
    'spa': Icons.spa,
    'hot_tub': Icons.hot_tub,
    
    // Nature & Outdoor
    'nature': Icons.nature,
    'nature_people': Icons.nature_people,
    'park': Icons.park,
    'forest': Icons.forest,
    'grass': Icons.grass,
    'eco': Icons.eco,
    'yard': Icons.yard,
    'local_florist': Icons.local_florist,
    'terrain': Icons.terrain,
    'landscape': Icons.landscape,
    'emoji_nature': Icons.emoji_nature,
    'agriculture': Icons.agriculture,
    
    // Activities & Adventure
    'hiking': Icons.hiking,
    // ✅ FIXED: Use 'outdoor_grill' for camping theme
    'camping': Icons.outdoor_grill,
    // ✅ FIXED: Use 'outdoor_grill' for tent as well
    'tent': Icons.outdoor_grill,
    'fireplace': Icons.fireplace,
    'directions_run': Icons.directions_run,
    'directions_walk': Icons.directions_walk,
    'nordic_walking': Icons.nordic_walking,
    'golf_course': Icons.golf_course,
    'roller_skating': Icons.roller_skating,
    'skateboarding': Icons.skateboarding,
    
    // Animals & Wildlife
    'pets': Icons.pets,
    'cruelty_free': Icons.cruelty_free,
    
    // Travel & Tourism
    'luggage': Icons.luggage,
    'backpack': Icons.backpack,
    'explore': Icons.explore,
    'tour': Icons.tour,
    'map': Icons.map,
    'location_on': Icons.location_on,
    'place': Icons.place,
    'pin_drop': Icons.pin_drop,
    'push_pin': Icons.push_pin,
    'flag': Icons.flag,
    'emoji_flags': Icons.emoji_flags,
    'public': Icons.public,
    'travel_explore': Icons.travel_explore,
    
    // Photography & Media
    'camera_alt': Icons.camera_alt,
    'photo_camera': Icons.photo_camera,
    'photo': Icons.photo,
    'photo_library': Icons.photo_library,
    'image': Icons.image,
    'collections': Icons.collections,
    'photo_album': Icons.photo_album,
    'videocam': Icons.videocam,
    
    // Services & Utilities
    'local_laundry_service': Icons.local_laundry_service,
    'local_shipping': Icons.local_shipping,
    'delivery_dining': Icons.delivery_dining,
    'cleaning_services': Icons.cleaning_services,
    'plumbing': Icons.plumbing,
    'electrical_services': Icons.electrical_services,
    'hvac': Icons.hvac,
    'pest_control': Icons.pest_control,
    'miscellaneous_services': Icons.miscellaneous_services,
    
    // Health & Wellness
    'favorite': Icons.favorite,
    'health_and_safety': Icons.health_and_safety,
    'medical_services': Icons.medical_services,
    'local_hospital': Icons.local_hospital,
    'local_pharmacy': Icons.local_pharmacy,
    'healing': Icons.healing,
    'self_improvement': Icons.self_improvement,
    'psychology': Icons.psychology,
    'mood': Icons.mood,
    'sentiment_satisfied': Icons.sentiment_satisfied,
    
    // Miscellaneous
    'star': Icons.star,
    'star_border': Icons.star_border,
    'grade': Icons.grade,
    'emoji_emotions': Icons.emoji_emotions,
    'emoji_events': Icons.emoji_events,
    'military_tech': Icons.military_tech,
    'workspace_premium': Icons.workspace_premium,
    'verified': Icons.verified,
    'new_releases': Icons.new_releases,
    'tips_and_updates': Icons.tips_and_updates,
    'lightbulb': Icons.lightbulb,
    'wb_sunny': Icons.wb_sunny,
    'wb_twilight': Icons.wb_twilight,
    'nightlight': Icons.nightlight,
    'category': Icons.category,
    'apps': Icons.apps,
    'dashboard': Icons.dashboard,
    'view_module': Icons.view_module,
    'widgets': Icons.widgets,
    
    // ✅ Legacy compatibility - mapped to valid icons
    'handmade': Icons.handyman,
    'package': Icons.inventory,
    'compass': Icons.explore,
    'palmtree': Icons.park,
    'flower': Icons.local_florist,
    'butterfly': Icons.emoji_nature,
    'island': Icons.landscape,
    'bath': Icons.bathtub,
    'walking': Icons.directions_walk,
    'beach_umbrella': Icons.beach_access,
    'art_track': Icons.palette,
    'shop': Icons.storefront,
    'ferry': Icons.directions_boat,
    'swim': Icons.pool,
    'skiing': Icons.downhill_skiing,
    'sports_kayaking': Icons.kayaking,
    'outdoor_grill': Icons.outdoor_grill,
    
    // Default fallback
    'default': Icons.category,
  };

  /// Get IconData from icon name
  static IconData getIconData(String iconName) {
    final sanitized = iconName.trim().toLowerCase();
    return _materialIcons[sanitized] ?? _materialIcons['default']!;
  }

  /// Build an icon widget with color
  static Widget buildIcon(String iconName, {double size = 28, Color? color}) {
    final iconData = getIconData(iconName);
    return Icon(iconData, size: size, color: color);
  }

  /// Get all available icon names with their display names
  static List<Map<String, String>> getAvailableIcons() {
    final List<String> keys = _materialIcons.keys.where((k) => k != 'default').toList();
    
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
    return _materialIcons.containsKey(iconName.trim().toLowerCase());
  }
}