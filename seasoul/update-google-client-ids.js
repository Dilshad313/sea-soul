#!/usr/bin/env node

/**
 * Helper script to update Google Client IDs across all files
 * 
 * Usage: node update-google-client-ids.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

console.log('\n' + '═'.repeat(70));
console.log('🔧 Google Client ID Update Helper');
console.log('═'.repeat(70));
console.log('\n📝 This script will help you update all Google Client IDs\n');

async function main() {
  try {
    console.log('First, create your OAuth 2.0 Client IDs in Google Cloud Console:');
    console.log('👉 https://console.cloud.google.com/apis/credentials\n');
    
    const androidClientId = await question('Enter your Android/iOS Client ID: ');
    const webClientId = await question('Enter your Web Client ID: ');
    const clientSecret = await question('Enter your Google Client Secret (optional, press Enter to skip): ');
    
    if (!androidClientId.includes('.apps.googleusercontent.com')) {
      console.log('\n❌ Error: Android Client ID should end with .apps.googleusercontent.com');
      process.exit(1);
    }
    
    if (!webClientId.includes('.apps.googleusercontent.com')) {
      console.log('\n❌ Error: Web Client ID should end with .apps.googleusercontent.com');
      process.exit(1);
    }
    
    console.log('\n' + '─'.repeat(70));
    console.log('📝 Updating files...\n');
    
    // 1. Update server/.env
    const envPath = path.join(__dirname, 'server', '.env');
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      // Update Android Client ID
      envContent = envContent.replace(
        /GOOGLE_ANDROID_CLIENT_ID="[^"]*"/,
        `GOOGLE_ANDROID_CLIENT_ID="${androidClientId}"`
      );
      
      // Update iOS Client ID
      envContent = envContent.replace(
        /GOOGLE_IOS_CLIENT_ID="[^"]*"/,
        `GOOGLE_IOS_CLIENT_ID="${androidClientId}"`
      );
      
      // Update Web Client ID
      envContent = envContent.replace(
        /GOOGLE_WEB_CLIENT_ID="[^"]*"/,
        `GOOGLE_WEB_CLIENT_ID="${webClientId}"`
      );
      
      // Update Client Secret if provided
      if (clientSecret) {
        envContent = envContent.replace(
          /GOOGLE_CLIENT_SECRET="[^"]*"/,
          `GOOGLE_CLIENT_SECRET="${clientSecret}"`
        );
      }
      
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Updated: server/.env');
    } else {
      console.log('⚠️  Warning: server/.env not found');
    }
    
    // 2. Update lib/services/google_signin_service.dart
    const servicePath = path.join(__dirname, 'lib', 'services', 'google_signin_service.dart');
    if (fs.existsSync(servicePath)) {
      let serviceContent = fs.readFileSync(servicePath, 'utf8');
      
      // Update Android Client ID
      serviceContent = serviceContent.replace(
        /_androidClientId\s*=\s*['"][^'"]*['"]/,
        `_androidClientId =\n      '${androidClientId}'`
      );
      
      // Update iOS Client ID
      serviceContent = serviceContent.replace(
        /_iosClientId\s*=\s*['"][^'"]*['"]/,
        `_iosClientId =\n      '${androidClientId}'`
      );
      
      // Update Web Client ID
      serviceContent = serviceContent.replace(
        /_webClientId\s*=\s*['"][^'"]*['"]/,
        `_webClientId =\n      '${webClientId}'`
      );
      
      fs.writeFileSync(servicePath, serviceContent);
      console.log('✅ Updated: lib/services/google_signin_service.dart');
    } else {
      console.log('⚠️  Warning: google_signin_service.dart not found');
    }
    
    // 3. Update web/index.html
    const htmlPath = path.join(__dirname, 'web', 'index.html');
    if (fs.existsSync(htmlPath)) {
      let htmlContent = fs.readFileSync(htmlPath, 'utf8');
      
      htmlContent = htmlContent.replace(
        /google-signin-client_id.*?content="[^"]*"/,
        `google-signin-client_id" content="${webClientId}"`
      );
      
      // Also update in console.log if present
      htmlContent = htmlContent.replace(
        /Client ID configured: [^\s)]+/,
        `Client ID configured: ${webClientId}`
      );
      
      fs.writeFileSync(htmlPath, htmlContent);
      console.log('✅ Updated: web/index.html');
    } else {
      console.log('⚠️  Warning: web/index.html not found');
    }
    
    // 4. Update ios/Runner/Info.plist
    const plistPath = path.join(__dirname, 'ios', 'Runner', 'Info.plist');
    if (fs.existsSync(plistPath)) {
      let plistContent = fs.readFileSync(plistPath, 'utf8');
      
      // Extract the reversed client ID
      const clientIdPart = androidClientId.replace('.apps.googleusercontent.com', '');
      const reversedClientId = `com.googleusercontent.apps.${clientIdPart}`;
      
      // Update CFBundleURLSchemes
      plistContent = plistContent.replace(
        /<string>com\.googleusercontent\.apps\.[^<]+<\/string>/,
        `<string>${reversedClientId}</string>`
      );
      
      // Update GIDClientID
      plistContent = plistContent.replace(
        /<key>GIDClientID<\/key>\s*<string>[^<]*<\/string>/,
        `<key>GIDClientID</key>\n\t<string>${androidClientId}</string>`
      );
      
      fs.writeFileSync(plistPath, plistContent);
      console.log('✅ Updated: ios/Runner/Info.plist');
      console.log(`   Reversed Client ID: ${reversedClientId}`);
    } else {
      console.log('⚠️  Warning: ios/Runner/Info.plist not found');
    }
    
    console.log('\n' + '═'.repeat(70));
    console.log('✅ All files updated successfully!');
    console.log('═'.repeat(70));
    
    console.log('\n📝 Next Steps:\n');
    console.log('1. Make sure in Google Cloud Console:');
    console.log('   - Add SHA-1 fingerprint to Android Client');
    console.log('   - Add http://localhost:8080 to Web Client authorized origins');
    console.log('   - Add http://localhost:8080/auth/google/callback to redirects\n');
    
    console.log('2. Clean and rebuild:');
    console.log('   flutter clean');
    console.log('   flutter pub get');
    console.log('   cd ios && pod install && cd ..\n');
    
    console.log('3. Test:');
    console.log('   flutter run -d chrome --web-port=8080  # For web');
    console.log('   flutter run                             # For mobile\n');
    
    console.log('4. Verify configuration:');
    console.log('   node verify-google-signin.js\n');
    
    console.log('📚 See FIX_DELETED_CLIENT.md for detailed instructions\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
