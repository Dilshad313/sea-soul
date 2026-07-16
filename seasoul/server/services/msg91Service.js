// services/msg91Service.js - FIXED VERSION
const axios = require('axios');
require('dotenv').config();

class MSG91Service {
  constructor() {
    this.authKey = process.env.MSG91_AUTH_KEY;
    this.senderId = process.env.MSG91_SENDER_ID;
    this.widgetId = process.env.MSG91_WIDGET_ID;
    this.tokenAuth = process.env.MSG91_TOKEN_AUTH;
    this.baseUrl = 'https://api.msg91.com/api/v5';
    
    console.log('========================================');
    console.log('🔧 MSG91 Service Initialized');
    console.log(`📌 Auth Key: ${this.authKey ? '✅ Present' : '❌ Missing'}`);
    console.log(`📌 Sender ID: ${this.senderId || '❌ Missing'}`);
    console.log(`📌 Widget ID: ${this.widgetId || '❌ Missing'}`);
    console.log(`📌 Token Auth: ${this.tokenAuth ? '✅ Present' : '❌ Missing'}`);
    console.log('========================================');
  }

  /**
   * ✅ SEND OTP - Main method
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

      // ✅ METHOD 1: Try Direct SMS API first (Most reliable)
      console.log('📤 Trying Direct SMS API...');
      const directResult = await this._sendOTPWithDirectSMS(mobile, otp);
      
      if (directResult.success) {
        console.log('✅ OTP sent via Direct SMS');
        return {
          success: true,
          otp: otp,
          data: directResult.data,
          method: 'direct'
        };
      }

      console.log('⚠️ Direct SMS failed, trying Widget API...');

      // ✅ METHOD 2: Try Widget API as fallback
      try {
        const widgetResult = await this._sendOTPWithWidget(mobile, otp);
        if (widgetResult.success) {
          console.log('✅ OTP sent via Widget API');
          return {
            success: true,
            otp: otp,
            data: widgetResult.data,
            method: 'widget'
          };
        }
        console.log('⚠️ Widget API also failed');
      } catch (widgetError) {
        console.log('⚠️ Widget API error:', widgetError.message);
      }

      // ✅ If all methods fail
      return {
        success: false,
        error: 'All SMS methods failed. Please check MSG91 configuration.'
      };

    } catch (error) {
      console.error('❌ MSG91 Error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * ✅ Send OTP using Direct SMS API (Most Reliable)
   */
  async _sendOTPWithDirectSMS(mobile, otp) {
    try {
      console.log(`📤 Direct SMS to: 91${mobile}`);
      console.log(`📝 OTP: ${otp}`);

      // ✅ Create proper message
      const message = `Your SeaSoul verification code is ${otp}. Valid for 10 minutes.`;

      // ✅ Using sendhttp.php endpoint
      const response = await axios.get(
        'https://api.msg91.com/api/sendhttp.php',
        {
          params: {
            authkey: this.authKey,
            mobiles: `91${mobile}`,
            message: message,
            sender: this.senderId || 'SEASOU',
            route: '1', // Transactional route
            country: '91',
            response: 'json'
          },
          timeout: 30000
        }
      );

      console.log('📥 Direct SMS Response:', response.data);

      // ✅ Check response properly
      if (response.data) {
        // MSG91 returns type: 'success' or 'error'
        if (response.data.type === 'success') {
          console.log('✅ SMS sent successfully via Direct API');
          return { 
            success: true, 
            data: response.data 
          };
        } else {
          console.error('❌ SMS API returned error:', response.data);
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
   * ✅ Send OTP using MSG91 Widget API
   */
  async _sendOTPWithWidget(mobile, otp) {
    try {
      const fullMobile = `91${mobile}`;
      console.log(`📤 Widget API to: ${fullMobile}`);

      const response = await axios.post(
        `${this.baseUrl}/otp`,
        {
          widget_id: this.widgetId,
          token_auth: this.tokenAuth,
          identifier: fullMobile,
          // ✅ For demo testing - use this if you have demo credentials
          // is_demo: false,
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

      // ✅ Generate new OTP and send via Direct SMS
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      console.log(`🔑 New OTP: ${otp}`);

      const directResult = await this._sendOTPWithDirectSMS(mobile, otp);
      
      if (directResult.success) {
        return {
          success: true,
          otp: otp,
          data: directResult.data,
          method: 'direct'
        };
      }

      // Try Widget API as fallback
      try {
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
            },
            timeout: 30000
          }
        );

        if (response.data && response.data.success === true) {
          return { 
            success: true, 
            data: response.data,
            otp: otp
          };
        }
      } catch (widgetError) {
        console.log('⚠️ Widget resend failed:', widgetError.message);
      }

      return { 
        success: false, 
        error: 'Failed to resend OTP' 
      };

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
    
    console.log(`✅ Cleaned phone: ${clean}`);
    return clean;
  }
}

module.exports = new MSG91Service();