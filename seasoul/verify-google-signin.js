#!/usr/bin/env node

/**
 * Google Sign-In Configuration Verification Script
 * Run this to verify your Google Sign-In setup
 * 
 * Usage: node verify-google-signin.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Verifying Google Sign-In Configuration...\n');
console.log('═'.repeat(60));

let errors = [];
let warnings = [];
let successes = [];

// Helper functions
function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    successes.push(`✅ ${description} exists`);
    return true;
  } else {
    errors.push(`❌ ${description} not found at: ${filePath}`);
    return false;
  }
}

function extractClientId(content, pattern, description) {
  const match = content.match(pattern);
  if (match && match[1]) {
    return match[1];
  }
  errors.push(`❌ Could not find ${description}`);
  return null;
}

// 1. Check Backend Configuration
console.log('\n📦 Backend Configuration (.env)');
console.log('─'.repeat(60));

const envPath = path.join(__dirname, 'server', '.env');
if (checkFile(envPath, 'Backend .env file')) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const androidClientId = extractClientId(
    envContent,
    /GOOGLE_ANDROID_CLIENT_ID="([^"]+)"/,
    'GOOGLE_ANDROID_CLIENT_ID'
  );
  
  const webClientId = extractClientId(
    envContent,
    /GOOGLE_WEB_CLIENT_ID="([^"]+)"/,
    'GOOGLE_WEB_CLIENT_ID'
  );
  
  const clientSecret = extractClientId(
    envContent,
    /GOOGLE_CLIENT_SECRET="([^"]+)"/,
    'GOOGLE_CLIENT_SECRET'
  );
  
  if (androidClientId) {
    successes.push(`✅ Android Client ID: ${androidClientId.substring(0, 20)}...`);
  }
  
  if (webClientId) {
    successes.push(`✅ Web Client ID: ${webClientId.substring(0, 20)}...`);
  }
  
  if (clientSecret) {
    successes.push(`✅ Google Client Secret configured`);
  }
  
  // Check for typos
  if (envContent.includes('GOOGE_') || envContent.includes('CLLIENT_')) {
    errors.push(`❌ Found typo in .env file (GOOGE_ or CLLIENT_)`);
  }
}

// 2. Check Flutter Service Configuration
console.log('\n📱 Flutter Service Configuration');
console.log('─'.repeat(60));

const googleServicePath = path.join(__dirname, 'lib', 'services', 'google_signin_service.dart');
if (checkFile(googleServicePath, 'Google Sign-In Service')) {
  const serviceContent = fs.readFileSync(googleServicePath, 'utf8');
  
  const androidClientInService = extractClientId(
    serviceContent,
    /_androidClientId\s*=\s*['"]([^'"]+)['"]/,
    'Android Client ID in service'
  );
  
  const webClientInService = extractClientId(
    serviceContent,
    /_webClientId\s*=\s*['"]([^'"]+)['"]/,
    'Web Client ID in service'
  );
  
  if (androidClientInService) {
    successes.push(`✅ Service Android Client ID: ${androidClientInService.substring(0, 20)}...`);
  }
  
  if (webClientInService) {
    successes.push(`✅ Service Web Client ID: ${webClientInService.substring(0, 20)}...`);
  }
}

// 3. Check iOS Configuration
console.log('\n🍎 iOS Configuration');
console.log('─'.repeat(60));

const infoPlistPath = path.join(__dirname, 'ios', 'Runner', 'Info.plist');
if (checkFile(infoPlistPath, 'iOS Info.plist')) {
  const plistContent = fs.readFileSync(infoPlistPath, 'utf8');
  
  if (plistContent.includes('CFBundleURLTypes')) {
    successes.push(`✅ CFBundleURLTypes configured`);
  } else {
    errors.push(`❌ CFBundleURLTypes not found in Info.plist`);
  }
  
  if (plistContent.includes('GIDClientID')) {
    successes.push(`✅ GIDClientID configured`);
  } else {
    errors.push(`❌ GIDClientID not found in Info.plist`);
  }
  
  const urlScheme = plistContent.match(/<string>com\.googleusercontent\.apps\.([^<]+)<\/string>/);
  if (urlScheme) {
    successes.push(`✅ URL Scheme configured: com.googleusercontent.apps.${urlScheme[1].substring(0, 15)}...`);
  }
}

// 4. Check Web Configuration
console.log('\n🌐 Web Configuration');
console.log('─'.repeat(60));

const indexHtmlPath = path.join(__dirname, 'web', 'index.html');
if (checkFile(indexHtmlPath, 'Web index.html')) {
  const htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
  
  if (htmlContent.includes('accounts.google.com/gsi/client')) {
    successes.push(`✅ Google Identity Services script included`);
  } else {
    errors.push(`❌ Google Identity Services script not found`);
  }
  
  const metaClientId = htmlContent.match(/google-signin-client_id.*?content="([^"]+)"/);
  if (metaClientId && metaClientId[1]) {
    successes.push(`✅ Meta tag Client ID: ${metaClientId[1].substring(0, 20)}...`);
  } else {
    warnings.push(`⚠️  Meta tag with client_id not found (optional but recommended)`);
  }
}

// 5. Check pubspec.yaml
console.log('\n📦 Package Dependencies');
console.log('─'.repeat(60));

const pubspecPath = path.join(__dirname, 'pubspec.yaml');
if (checkFile(pubspecPath, 'pubspec.yaml')) {
  const pubspecContent = fs.readFileSync(pubspecPath, 'utf8');
  
  if (pubspecContent.includes('google_sign_in:')) {
    successes.push(`✅ google_sign_in package included`);
  } else {
    errors.push(`❌ google_sign_in package not found in pubspec.yaml`);
  }
  
  if (pubspecContent.includes('google_sign_in_web:')) {
    successes.push(`✅ google_sign_in_web package included`);
  } else {
    warnings.push(`⚠️  google_sign_in_web package not found (required for web support)`);
  }
}

// 6. Check Android Configuration
console.log('\n🤖 Android Configuration');
console.log('─'.repeat(60));

const androidManifestPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
if (checkFile(androidManifestPath, 'AndroidManifest.xml')) {
  const manifestContent = fs.readFileSync(androidManifestPath, 'utf8');
  
  const packageName = manifestContent.match(/package="([^"]+)"/);
  if (packageName && packageName[1]) {
    successes.push(`✅ Package name: ${packageName[1]}`);
  }
  
  if (manifestContent.includes('INTERNET')) {
    successes.push(`✅ INTERNET permission granted`);
  } else {
    errors.push(`❌ INTERNET permission not found`);
  }
}

// Print Results
console.log('\n' + '═'.repeat(60));
console.log('📊 VERIFICATION RESULTS');
console.log('═'.repeat(60));

if (successes.length > 0) {
  console.log('\n✅ Successes:');
  successes.forEach(s => console.log(`   ${s}`));
}

if (warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  warnings.forEach(w => console.log(`   ${w}`));
}

if (errors.length > 0) {
  console.log('\n❌ Errors:');
  errors.forEach(e => console.log(`   ${e}`));
  console.log('\n🔧 Please fix the errors above before proceeding.');
  process.exit(1);
} else {
  console.log('\n' + '═'.repeat(60));
  console.log('🎉 Configuration Verified Successfully!');
  console.log('═'.repeat(60));
  console.log('\n📝 Next Steps:');
  console.log('   1. Run `flutter clean && flutter pub get`');
  console.log('   2. For iOS: `cd ios && pod install && cd ..`');
  console.log('   3. Test on each platform:');
  console.log('      - Android: flutter run');
  console.log('      - iOS: flutter run');
  console.log('      - Web: flutter run -d chrome --web-port=8080');
  console.log('\n📚 See GOOGLE_SIGNIN_SETUP.md for detailed setup guide');
  console.log('\n');
}
