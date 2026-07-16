// services/msg91Service.js
const axios = require('axios');
require('dotenv').config();

class MSG91Service {
  constructor() {
    this.authKey = process.env.MSG91_API_KEY;
    this.senderId = process.env.MSG91_SENDER_ID;
    this.widgetId = process.env.MSG91_WIDGET_ID;
    this.tokenAuth = process.env.MSG91_TOKEN_AUTH;
    this.baseUrl = 'https://api.msg91.com/api/v5';
  }

  /**
   * Send OTP via MSG91 Widget
   * This uses the MSG91 OTP Widget/SDK method
   */
  async sendOTP(phoneNumber) {
    try {
      console.log(`📤 Sending OTP via MSG91 Widget to ${phoneNumber}...`);

      // Clean phone number - remove spaces, +91, etc.
      let mobile = phoneNumber.replace(/\s/g, '');
      if (mobile.startsWith('+91')) {
        mobile = mobile.substring(3);
      } else if (mobile.startsWith('91')) {
        mobile = mobile.substring(2);
      }
      
      // Ensure 10 digits
      if (mobile.length !== 10) {
        console.error(`❌ Invalid phone: ${mobile}`);
        return { success: false, error: 'Invalid phone number' };
      }

      // Create mobile number with country code
      const fullMobile = `91${mobile}`;

      // ✅ Using MSG91 OTP Widget API
      // Reference: https://docs.msg91.com/apis/otp/verify-otp
      
      // Method 1: Using Widget API (Recommended - uses your widget config)
      const response = await axios.post(
        `${this.baseUrl}/otp`,
        {
          widget_id: this.widgetId,
          token_auth: this.tokenAuth,
          identifier: fullMobile,
          // Optional: If you want to use demo credentials
          // is_demo: true
        },
        {
          headers: {
            'authkey': this.authKey,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('📥 MSG91 Widget Response:', response.data);

      if (response.data && response.data.success === true) {
        console.log('✅ OTP sent successfully via MSG91 Widget');
        return { 
          success: true, 
          data: response.data,
          orderId: response.data.order_id // For verification
        };
      } else {
        console.error('❌ MSG91 Widget failed:', response.data);
        return { success: false, error: response.data.message || 'Failed to send OTP' };
      }

    } catch (error) {
      console.error('❌ MSG91 Error:', error.message);
      if (error.response) {
        console.error('   Response:', error.response.data);
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify OTP using MSG91 Widget
   */
  async verifyOTP(phoneNumber, otp) {
    try {
      console.log(`🔍 Verifying OTP for ${phoneNumber}...`);

      let mobile = phoneNumber.replace(/\s/g, '');
      if (mobile.startsWith('+91')) {
        mobile = mobile.substring(3);
      } else if (mobile.startsWith('91')) {
        mobile = mobile.substring(2);
      }
      
      if (mobile.length !== 10) {
        return { success: false, error: 'Invalid phone number' };
      }

      const fullMobile = `91${mobile}`;

      // ✅ Verify OTP using MSG91 API
      const response = await axios.post(
        `${this.baseUrl}/otp/verify`,
        {
          widget_id: this.widgetId,
          token_auth: this.tokenAuth,
          identifier: fullMobile,
          otp: otp
        },
        {
          headers: {
            'authkey': this.authKey,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('📥 MSG91 Verify Response:', response.data);

      if (response.data && response.data.success === true) {
        console.log('✅ OTP verified successfully');
        return { 
          success: true, 
          data: response.data,
          verified: true
        };
      } else {
        console.error('❌ OTP verification failed:', response.data);
        return { success: false, error: response.data.message || 'Invalid OTP' };
      }

    } catch (error) {
      console.error('❌ OTP Verify Error:', error.message);
      if (error.response) {
        console.error('   Response:', error.response.data);
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * Resend OTP
   */
  async resendOTP(phoneNumber) {
    try {
      console.log(`📤 Resending OTP to ${phoneNumber}...`);

      let mobile = phoneNumber.replace(/\s/g, '');
      if (mobile.startsWith('+91')) {
        mobile = mobile.substring(3);
      } else if (mobile.startsWith('91')) {
        mobile = mobile.substring(2);
      }
      
      if (mobile.length !== 10) {
        return { success: false, error: 'Invalid phone number' };
      }

      const fullMobile = `91${mobile}`;

      const response = await axios.post(
        `${this.baseUrl}/otp/resend`,
        {
          widget_id: this.widgetId,
          token_auth: this.tokenAuth,
          identifier: fullMobile
        },
        {
          headers: {
            'authkey': this.authKey,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('📥 MSG91 Resend Response:', response.data);

      if (response.data && response.data.success === true) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.data.message || 'Failed to resend OTP' };
      }

    } catch (error) {
      console.error('❌ Resend Error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Alternative: Use Direct SMS API (Fallback)
   */
  async sendSMSDirect(phoneNumber, message) {
    try {
      console.log(`📤 Sending SMS directly to ${phoneNumber}...`);

      let mobile = phoneNumber.replace(/\s/g, '');
      if (mobile.startsWith('+91')) {
        mobile = mobile.substring(3);
      } else if (mobile.startsWith('91')) {
        mobile = mobile.substring(2);
      }
      
      if (mobile.length !== 10) {
        return { success: false, error: 'Invalid phone number' };
      }

      const response = await axios.get(
        `https://api.msg91.com/api/sendhttp.php`,
        {
          params: {
            authkey: this.authKey,
            mobiles: `91${mobile}`,
            message: message,
            sender: this.senderId || 'SEASOU',
            route: '1',
            country: '91',
            response: 'json'
          }
        }
      );

      console.log('📥 SMS Response:', response.data);

      if (response.data && response.data.type === 'success') {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.data.message || 'Failed to send SMS' };
      }

    } catch (error) {
      console.error('❌ SMS Error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new MSG91Service();