class ImageUtils {
  static const String baseUrl = 'https://sea-soul-backend.vercel.app';
  
  static String getCleanImageUrl(String? imageUrl) {
    if (imageUrl == null || imageUrl.isEmpty) {
      print('⚠️ Image URL is null or empty');
      return 'https://via.placeholder.com/400x300?text=No+Image';
    }
    
    print('📸 Original image URL: $imageUrl');
    
    // ✅ If it's a Cloudinary URL, return as is
    if (imageUrl.contains('res.cloudinary.com')) {
      print('✅ Cloudinary URL detected: $imageUrl');
      return imageUrl;
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
    
    // ✅ If it's a localhost URL, replace with production URL
    if (imageUrl.contains('localhost') || 
        imageUrl.contains('127.0.0.1') ||
        imageUrl.contains('192.168')) {
      final cleanUrl = imageUrl
          .replaceAll('http://localhost:5000', baseUrl)
          .replaceAll('http://127.0.0.1:5000', baseUrl)
          .replaceAll('http://192.168.1.100:5000', baseUrl);
      print('✅ Localhost URL converted to: $cleanUrl');
      return cleanUrl;
    }
    
    // ✅ Default: return as is with base URL
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
    return imageUrl.startsWith('http') || imageUrl.startsWith('data:image');
  }
}