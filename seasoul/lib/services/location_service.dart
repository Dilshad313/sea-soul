import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'dart:math';

class LocationService {
  static const double EARTH_RADIUS_KM = 6371.0;

  // ✅ Get current location
  static Future<Position?> getCurrentLocation() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        return null;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          return null;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        return null;
      }

      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 10),
      );
    } catch (e) {
      print('❌ Error getting location: $e');
      return null;
    }
  }

  // ✅ Get location name from coordinates
  static Future<String> getLocationName(double latitude, double longitude) async {
    try {
      List<Placemark> placemarks = await placemarkFromCoordinates(latitude, longitude);
      if (placemarks.isNotEmpty) {
        Placemark place = placemarks.first;
        String city = place.locality ?? place.administrativeArea ?? place.country ?? '';
        if (city.isNotEmpty) {
          return city;
        }
        return place.subLocality ?? place.thoroughfare ?? 'Your Location';
      }
      return 'Your Location';
    } catch (e) {
      print('❌ Error getting location name: $e');
      return 'Your Location';
    }
  }

  // ✅ Calculate distance between two coordinates (Haversine formula)
  static double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
    double dLat = _toRadians(lat2 - lat1);
    double dLon = _toRadians(lon2 - lon1);

    double a = pow(sin(dLat / 2), 2) +
        cos(_toRadians(lat1)) * cos(_toRadians(lat2)) *
        pow(sin(dLon / 2), 2);

    double c = 2 * atan2(sqrt(a), sqrt(1 - a));

    return EARTH_RADIUS_KM * c;
  }

  static double _toRadians(double degree) {
    return degree * pi / 180;
  }

  // ✅ Format distance for display
  static String formatDistance(double distanceInKm) {
    if (distanceInKm < 1) {
      return '${(distanceInKm * 1000).round()} m';
    } else if (distanceInKm < 10) {
      return '${distanceInKm.toStringAsFixed(1)} km';
    } else {
      return '${distanceInKm.round()} km';
    }
  }

  // ✅ Get distance from current location to a destination
  static Future<Map<String, dynamic>> getDistanceToDestination({
    required double destLat,
    required double destLon,
    String? destName,
  }) async {
    try {
      Position? currentPos = await getCurrentLocation();
      
      if (currentPos == null) {
        return {
          'success': false,
          'distance': 0.0,
          'formattedDistance': 'Location off',
          'fromLocation': 'Unknown',
          'error': 'Location service not available',
        };
      }

      double distance = calculateDistance(
        currentPos.latitude,
        currentPos.longitude,
        destLat,
        destLon,
      );

      String fromLocation = await getLocationName(
        currentPos.latitude,
        currentPos.longitude,
      );

      return {
        'success': true,
        'distance': distance,
        'formattedDistance': formatDistance(distance),
        'fromLocation': fromLocation,
        'currentLat': currentPos.latitude,
        'currentLon': currentPos.longitude,
        'destLat': destLat,
        'destLon': destLon,
      };
    } catch (e) {
      print('❌ Error getting distance: $e');
      return {
        'success': false,
        'distance': 0.0,
        'formattedDistance': '--',
        'fromLocation': 'Unknown',
        'error': e.toString(),
      };
    }
  }

  // ✅ Get distance using Google Maps API (More accurate - Optional)
  // Requires Google Maps API key
  static Future<Map<String, dynamic>> getDistanceFromGoogleMaps({
    required double originLat,
    required double originLon,
    required double destLat,
    required double destLon,
    String? apiKey,
  }) async {
    try {
      if (apiKey == null || apiKey.isEmpty) {
        // Fallback to Haversine formula
        return await getDistanceToDestination(
          destLat: destLat,
          destLon: destLon,
        );
      }

      // Google Maps Distance Matrix API call
      // This requires internet and API key
      final String url = 
          'https://maps.googleapis.com/maps/api/distancematrix/json'
          '?origins=$originLat,$originLon'
          '&destinations=$destLat,$destLon'
          '&key=$apiKey'
          '&units=metric';

      // Note: You need to add http package for this
      // final response = await http.get(Uri.parse(url));
      // ... parse response

      return {
        'success': false,
        'error': 'Google Maps API not implemented yet',
      };
    } catch (e) {
      print('❌ Google Maps error: $e');
      return await getDistanceToDestination(
        destLat: destLat,
        destLon: destLon,
      );
    }
  }
}