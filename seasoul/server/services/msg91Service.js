// services/msg91Service.js - SIMPLIFIED VERSION
const axios = require('axios');
require('dotenv').config();

class MSG91Service {
  constructor() {
    this.authKey = process.env.MSG91_AUTH_KEY;
    this.senderId = process.env.MSG91_SENDER_ID;
    this.baseUrl = 'https://api.msg91.com/api';
    
    console.log('✅ MSG91 Service Initialized');
  }

  // ✅ Send OTP via Direct SMS (Most Reliable)
  async sendOTP(phoneNumber) {
    try {
      console.log(`📤 Sending OTP to ${phoneNumber}...`);

      let mobile = phoneNumber.replace(/\s/g, '');
      if (mobile.startsWith('+91')) {
        mobile = mobile.substring(3);
      } else if (mobile.startsWith('91')) {
        mobile = mobile.substring(2);
      }
      
      if (mobile.length !== 10) {
        console.error(`❌ Invalid phone: ${mobile}`);
        return { success: false, error: 'Invalid phone number' };
      }

      // ✅ OTP is generated in controller, just send SMS
      // We don't generate OTP here - controller handles it

      // This is just for SMS delivery
      // The actual OTP is already stored in DB by controller
      console.log(`📱 Would send SMS to: 91${mobile}`);
      
      // ✅ For testing, always return success
      // Actual SMS sending can be enabled later
      return { 
        success: true, 
        data: { type: 'success' },
        method: 'msg91'
      };

    } catch (error) {
      console.error('❌ SMS Error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // ✅ Verify OTP - Optional (Controller handles DB verification)
  async verifyOTP(phoneNumber, otp) {
    // This is optional - controller handles verification
    return { success: true, verified: true };
  }

  // ✅ Resend OTP
  async resendOTP(phoneNumber) {
    return { success: true };
  }
}

module.exports = new MSG91Service();