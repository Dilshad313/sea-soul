import 'package:flutter/material.dart';
import 'package:seasoul/services/location_service.dart';
import 'package:geolocator/geolocator.dart';

class LocationPermissionDialog extends StatefulWidget {
  final VoidCallback onLocationEnabled;

  const LocationPermissionDialog({
    super.key,
    required this.onLocationEnabled,
  });

  @override
  State<LocationPermissionDialog> createState() => _LocationPermissionDialogState();
}

class _LocationPermissionDialogState extends State<LocationPermissionDialog> {
  bool _isChecking = false;
  bool _locationEnabled = false;

  static const Color deepNavy = Color(0xFF1A2B49);
  static const Color oceanBlue = Color(0xFF0099CC);
  static const Color sandWhite = Color(0xFFF8FBFF);

  @override
  void initState() {
    super.initState();
    _checkLocationStatus();
  }

  Future<void> _checkLocationStatus() async {
    setState(() => _isChecking = true);
    
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      LocationPermission permission = await Geolocator.checkPermission();
      
      setState(() {
        _locationEnabled = serviceEnabled && 
            (permission == LocationPermission.always || 
             permission == LocationPermission.whileInUse);
        _isChecking = false;
      });

      if (_locationEnabled) {
        // Location already enabled, close dialog
        widget.onLocationEnabled();
        if (mounted) {
          Navigator.pop(context);
        }
      }
    } catch (e) {
      setState(() => _isChecking = false);
      print('❌ Error checking location: $e');
    }
  }

  Future<void> _enableLocation() async {
    setState(() => _isChecking = true);

    try {
      // Open location settings
      await Geolocator.openLocationSettings();
      
      // Wait a bit and check again
      await Future.delayed(const Duration(seconds: 2));
      await _checkLocationStatus();
      
      if (_locationEnabled) {
        widget.onLocationEnabled();
        if (mounted) {
          Navigator.pop(context);
        }
      }
    } catch (e) {
      setState(() => _isChecking = false);
      print('❌ Error enabling location: $e');
    }
  }

  Future<void> _requestPermission() async {
    setState(() => _isChecking = true);

    try {
      LocationPermission permission = await Geolocator.requestPermission();
      
      if (permission == LocationPermission.always || 
          permission == LocationPermission.whileInUse) {
        setState(() {
          _locationEnabled = true;
          _isChecking = false;
        });
        widget.onLocationEnabled();
        if (mounted) {
          Navigator.pop(context);
        }
      } else {
        setState(() => _isChecking = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Location permission is required for distance calculation'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    } catch (e) {
      setState(() => _isChecking = false);
      print('❌ Error requesting permission: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 20,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Icon
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: oceanBlue.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                _locationEnabled ? Icons.location_on : Icons.location_off,
                color: _locationEnabled ? oceanBlue : Colors.red,
                size: 36,
              ),
            ),
            const SizedBox(height: 16),

            // Title
            Text(
              _locationEnabled ? '✅ Location Enabled' : 'Enable Location',
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: deepNavy,
              ),
            ),
            const SizedBox(height: 8),

            // Description
            Text(
              _locationEnabled
                  ? 'Your location is enabled. You can see real distances to destinations.'
                  : 'Allow location access to see real distances to packages and activities in Lakshadweep.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: const Color(0xFF6E7880),
                fontFamily: 'Inter',
                height: 1.5,
              ),
            ),
            const SizedBox(height: 24),

            if (_isChecking) ...[
              const SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(
                  color: oceanBlue,
                ),
              ),
              const SizedBox(height: 16),
            ],

            if (!_isChecking && !_locationEnabled) ...[
              // Enable Location Button
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _enableLocation,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: oceanBlue,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.settings, color: Colors.white, size: 20),
                      SizedBox(width: 8),
                      Text(
                        'Enable Location',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 12),
              // Grant Permission Button
              SizedBox(
                width: double.infinity,
                height: 50,
                child: OutlinedButton(
                  onPressed: _requestPermission,
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: oceanBlue),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.gps_fixed, color: oceanBlue, size: 20),
                      const SizedBox(width: 8),
                      Text(
                        'Grant Permission',
                        style: TextStyle(
                          color: oceanBlue,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 12),
            ],

            if (!_isChecking && _locationEnabled) ...[
              // Continue Button
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: () {
                    widget.onLocationEnabled();
                    Navigator.pop(context);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: const Text(
                    'Continue',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
              ),
            ],

            // Skip button (always visible)
            const SizedBox(height: 8),
            TextButton(
              onPressed: () {
                // Close dialog without enabling location
                Navigator.pop(context);
              },
              child: const Text(
                'Skip for now',
                style: TextStyle(
                  color: Color(0xFF6E7880),
                  fontSize: 14,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ✅ Helper function to show location dialog
class LocationHelper {
  static Future<bool> requestLocationIfNeeded(BuildContext context) async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      LocationPermission permission = await Geolocator.checkPermission();
      
      bool locationEnabled = serviceEnabled && 
          (permission == LocationPermission.always || 
           permission == LocationPermission.whileInUse);

      if (locationEnabled) {
        return true;
      }

      // Show dialog to enable location
      bool? result = await showDialog<bool>(
        context: context,
        barrierDismissible: false,
        builder: (context) => LocationPermissionDialog(
          onLocationEnabled: () {},
        ),
      );

      return result ?? false;
    } catch (e) {
      print('❌ Error in location request: $e');
      return false;
    }
  }
}