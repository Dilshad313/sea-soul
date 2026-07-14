class ImageUtils {
  static const String baseUrl = 'https://sea-soul-backend.vercel.app';
  
  // ✅ Convert AVIF to supported format or use fallback
  static String getCleanImageUrl(String? imageUrl) {
    if (imageUrl == null || imageUrl.isEmpty) {
      print('⚠️ Image URL is null or empty');
      return 'https://via.placeholder.com/400x300?text=No+Image';
    }
    
    print('📸 Original image URL: $imageUrl');
    
    // ✅ If it's a Cloudinary URL, convert AVIF to JPG/PNG for better browser support
    if (imageUrl.contains('res.cloudinary.com')) {
      // ✅ Replace .avif with .jpg for better browser compatibility
      if (imageUrl.contains('.avif')) {
        // Cloudinary can auto-convert format using f_auto
        // Add f_auto to the URL if not present
        if (!imageUrl.contains('f_auto')) {
          // Insert f_auto before the version part
          final parts = imageUrl.split('/');
          // Find the upload part and insert f_auto
          for (int i = 0; i < parts.length; i++) {
            if (parts[i] == 'upload') {
              parts.insert(i + 1, 'f_auto');
              break;
            }
          }
          final cleanUrl = parts.join('/');
          print('✅ Cloudinary URL converted to: $cleanUrl');
          return cleanUrl;
        }
        print('✅ Cloudinary URL with f_auto: $imageUrl');
        return imageUrl;
      }
      
      // ✅ For non-AVIF Cloudinary URLs, add quality and format optimization
      if (!imageUrl.contains('f_auto') && !imageUrl.contains('q_auto')) {
        // Add quality optimization
        final parts = imageUrl.split('/');
        for (int i = 0; i < parts.length; i++) {
          if (parts[i] == 'upload') {
            parts.insert(i + 1, 'q_auto:good');
            break;
          }
        }
        final cleanUrl = parts.join('/');
        print('✅ Cloudinary URL optimized: $cleanUrl');
        return cleanUrl;
      }
      
      print('✅ Cloudinary URL: $imageUrl');
      return imageUrl;
    }
    
    // ✅ If it's a localhost URL (old images), replace with base URL
    if (imageUrl.contains('localhost') || 
        imageUrl.contains('127.0.0.1') ||
        imageUrl.contains('192.168')) {
      // Try to extract the filename
      final filename = imageUrl.split('/').last;
      // This is a local file, it won't work on Vercel
      // Show placeholder instead
      print('⚠️ Localhost URL detected: $imageUrl - Using placeholder');
      return 'https://via.placeholder.com/400x300?text=Image+Not+Found';
    }
    
    // ✅ If it's a valid HTTP/HTTPS URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      print('✅ HTTP/HTTPS URL detected: $imageUrl');
      return imageUrl;
    }
    
    // ✅ If it's a relative path, prepend base URL
    if (imageUrl.startsWith('/')) {
      final cleanUrl = '$baseUrl$imageUrl';
      print('✅ Relative path converted to: $cleanUrl');
      return cleanUrl;
    }
    
    print('✅ Returning as is: $imageUrl');
    return imageUrl;
  }
  
  // ✅ Get first image or placeholder
  static String getFirstImage(List<dynamic>? images) {
    if (images == null || images.isEmpty) {
      print('⚠️ Images list is null or empty');
      return 'https://via.placeholder.com/400x300?text=No+Image';
    }
    final firstImage = images[0]?.toString() ?? '';
    return getCleanImageUrl(firstImage);
  }
  
  // ✅ Check if image is valid
  static bool isValidImage(String? imageUrl) {
    if (imageUrl == null || imageUrl.isEmpty) return false;
    // Exclude localhost URLs
    if (imageUrl.contains('localhost') || imageUrl.contains('127.0.0.1')) {
      return false;
    }
    return imageUrl.startsWith('http') || imageUrl.startsWith('data:image');
  }
}