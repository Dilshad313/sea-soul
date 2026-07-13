// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;

String getOrigin() {
  try {
    final String? origin = html.window.location.origin;
    if (origin != null && origin.isNotEmpty) {
      return origin;
    }
  } catch (e) {
    // ignore: avoid_print
    print('⚠️ Error getting origin: $e');
  }
  return 'http://localhost:5000';
}
