class Environment {
  // ✅ Production URL (Vercel)
  static const String PRODUCTION_API_URL = 'https://sea-soul-backend.vercel.app';
  
  // ✅ Development URL
  static const String DEVELOPMENT_API_URL = 'https://sea-soul-backend.vercel.app';

  static String get apiUrl {
    // ✅ For production builds
    if (const bool.fromEnvironment('dart.vm.product')) {
      return PRODUCTION_API_URL;
    }
    return DEVELOPMENT_API_URL;
  }
}