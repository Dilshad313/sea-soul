// services/msg91Service.js - Complete Working Version
const axios = require('axios');
require('dotenv').config();

class MSG91Service {
  constructor() {
    this.authKey = process.env.MSG91_AUTH_KEY;
    this.senderId = process.env.MSG91_SENDER_ID;
    this.widgetId = process.env.MSG91_WIDGET_ID;
    this.tokenAuth = process.env.MSG91_TOKEN_AUTH;
    this.baseUrl = 'https://api.msg91.com/api/v5';
  }

  /**
   * ✅ SEND OTP - Main method
   * Uses MSG91 Widget API (4-digit OTP)
   */
  async sendOTP(phoneNumber) {
    try {
      console.log('========================================');
      console.log('📤 MSG91: Sending OTP');
      console.log(`📱 Phone: ${phoneNumber}`);
      console.log('========================================');

      // Clean phone number
      let mobile = this._cleanPhoneNumber(phoneNumber);
      
      if (!mobile) {
        return { success: false, error: 'Invalid phone number' };
      }

      // ✅ Generate 4-digit OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      console.log(`🔑 Generated OTP: ${otp}`);

      // ✅ Method 1: Try Widget API first
      try {
        const widgetResult = await this._sendOTPWithWidget(mobile, otp);
        if (widgetResult.success) {
          return {
            success: true,
            otp: otp,
            data: widgetResult.data,
            method: 'widget'
          };
        }
        console.log('⚠️ Widget API failed, trying Direct SMS...');
      } catch (widgetError) {
        console.log('⚠️ Widget API error:', widgetError.message);
      }

      // ✅ Method 2: Fallback to Direct SMS
      const directResult = await this._sendOTPWithDirectSMS(mobile, otp);
      
      if (directResult.success) {
        return {
          success: true,
          otp: otp,
          data: directResult.data,
          method: 'direct'
        };
      }

      return {
        success: false,
        error: directResult.error || 'Failed to send OTP'
      };

    } catch (error) {
      console.error('❌ MSG91 Error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * ✅ Send OTP using MSG91 Widget API
   */
  async _sendOTPWithWidget(mobile, otp) {
    try {
      const fullMobile = `91${mobile}`;
      console.log(`📤 Sending via Widget API to: ${fullMobile}`);

      const response = await axios.post(
        `${this.baseUrl}/otp`,
        {
          widget_id: this.widgetId,
          token_auth: this.tokenAuth,
          identifier: fullMobile,
          // ✅ For demo testing - uncomment if using demo
          // is_demo: true,
          // otp: otp // Optional: Send your own OTP
        },
        {
          headers: {
            'authkey': this.authKey,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      console.log('📥 Widget Response:', response.status, response.data);

      if (response.data && response.data.success === true) {
        return { 
          success: true, 
          data: response.data,
          orderId: response.data.order_id
        };
      }

      return { 
        success: false, 
        error: response.data?.message || 'Widget API failed' 
      };

    } catch (error) {
      console.error('❌ Widget API Error:', error.message);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', error.response.data);
      }
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  /**
   * ✅ Send OTP using Direct SMS API (Fallback)
   */
  async _sendOTPWithDirectSMS(mobile, otp) {
    try {
      console.log(`📤 Sending via Direct SMS to: 91${mobile}`);

      const message = `Your SeaSoul verification code is ${otp}. Valid for 10 minutes.`;

      const response = await axios.get(
        'https://api.msg91.com/api/sendhttp.php',
        {
          params: {
            authkey: this.authKey,
            mobiles: `91${mobile}`,
            message: message,
            sender: this.senderId || 'SEASOU',
            route: '1',
            country: '91',
            response: 'json'
          },
          timeout: 30000
        }
      );

      console.log('📥 Direct SMS Response:', response.data);

      // ✅ Check response
      if (response.data) {
        if (response.data.type === 'success') {
          return { 
            success: true, 
            data: response.data 
          };
        } else {
          return { 
            success: false, 
            error: response.data.message || 'SMS sending failed' 
          };
        }
      }

      return { success: false, error: 'No response from MSG91' };

    } catch (error) {
      console.error('❌ Direct SMS Error:', error.message);
      if (error.response) {
        console.error('   Data:', error.response.data);
      }
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  /**
   * ✅ VERIFY OTP
   */
  async verifyOTP(phoneNumber, otp) {
    try {
      console.log('========================================');
      console.log('🔍 MSG91: Verifying OTP');
      console.log(`📱 Phone: ${phoneNumber}`);
      console.log(`🔑 OTP: ${otp}`);
      console.log('========================================');

      let mobile = this._cleanPhoneNumber(phoneNumber);
      if (!mobile) {
        return { success: false, error: 'Invalid phone number' };
      }

      const fullMobile = `91${mobile}`;

      // ✅ Try Widget API verification first
      try {
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
            },
            timeout: 30000
          }
        );

        console.log('📥 Verify Response:', response.data);

        if (response.data && response.data.success === true) {
          return { 
            success: true, 
            data: response.data,
            verified: true
          };
        }

        return { 
          success: false, 
          error: response.data?.message || 'Invalid OTP' 
        };

      } catch (error) {
        console.error('❌ Verify API Error:', error.message);
        if (error.response) {
          console.error('   Status:', error.response.status);
          console.error('   Data:', error.response.data);
        }
        return { 
          success: false, 
          error: error.response?.data?.message || 'Verification failed' 
        };
      }

    } catch (error) {
      console.error('❌ Verify Error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * ✅ RESEND OTP
   */
  async resendOTP(phoneNumber) {
    try {
      console.log('========================================');
      console.log('📤 MSG91: Resending OTP');
      console.log(`📱 Phone: ${phoneNumber}`);
      console.log('========================================');

      let mobile = this._cleanPhoneNumber(phoneNumber);
      if (!mobile) {
        return { success: false, error: 'Invalid phone number' };
      }

      const fullMobile = `91${mobile}`;

      // ✅ Try Widget API resend
      try {
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
            },
            timeout: 30000
          }
        );

        console.log('📥 Resend Response:', response.data);

        if (response.data && response.data.success === true) {
          // ✅ Generate new OTP for local storage
          const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
          return { 
            success: true, 
            data: response.data,
            otp: newOtp
          };
        }

        return { 
          success: false, 
          error: response.data?.message || 'Failed to resend OTP' 
        };

      } catch (error) {
        console.error('❌ Resend API Error:', error.message);
        if (error.response) {
          console.error('   Status:', error.response.status);
          console.error('   Data:', error.response.data);
        }

        // ✅ Fallback: Send via Direct SMS
        const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
        const directResult = await this._sendOTPWithDirectSMS(mobile, newOtp);
        
        if (directResult.success) {
          return {
            success: true,
            otp: newOtp,
            data: directResult.data,
            method: 'direct'
          };
        }

        return { 
          success: false, 
          error: error.response?.data?.message || 'Failed to resend OTP' 
        };
      }

    } catch (error) {
      console.error('❌ Resend Error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * ✅ Helper: Clean phone number
   */
  _cleanPhoneNumber(phone) {
    if (!phone) return null;
    
    let clean = phone.replace(/\s/g, '');
    
    // Remove +91 or 91
    if (clean.startsWith('+91')) {
      clean = clean.substring(3);
    } else if (clean.startsWith('91')) {
      clean = clean.substring(2);
    } else if (clean.startsWith('0')) {
      clean = clean.substring(1);
    }
    
    // Validate 10 digits
    if (!/^[0-9]{10}$/.test(clean)) {
      console.error(`❌ Invalid phone format: ${clean}`);
      return null;
    }
    
    return clean;
  }
}

module.exports = new MSG91Service();