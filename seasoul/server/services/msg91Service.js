// services/msg91Service.js - LIVE SMS VERSION
const axios = require('axios');
require('dotenv').config();

class MSG91Service {
  constructor() {
    // ✅ Only 3 credentials needed
    this.authKey = process.env.MSG91_AUTH_KEY;
    this.widgetId = process.env.MSG91_WIDGET_ID;
    this.tokenAuth = process.env.MSG91_TOKEN_AUTH;
    this.baseUrl = 'https://api.msg91.com/api/v5';
    
    console.log('========================================');
    console.log('🔧 MSG91 Service Initialized');
    console.log(`📌 Widget ID: ${this.widgetId ? '✅ Present' : '❌ Missing'}`);
    console.log(`📌 Token Auth: ${this.tokenAuth ? '✅ Present' : '❌ Missing'}`);
    console.log(`📌 Auth Key: ${this.authKey ? '✅ Present' : '❌ Missing'}`);
    console.log('========================================');
  }

  /**
   * ✅ Send OTP via MSG91 Widget - LIVE SMS
   * No demo - SMS will be sent to user's phone
   */
  async sendOTP(phoneNumber) {
    try {
      console.log('========================================');
      console.log('📤 MSG91: Sending LIVE OTP');
      console.log(`📱 Phone: ${phoneNumber}`);
      console.log('========================================');

      // Clean phone number
      let mobile = this._cleanPhoneNumber(phoneNumber);
      if (!mobile) {
        return { success: false, error: 'Invalid phone number' };
      }

      const fullMobile = `91${mobile}`;
      console.log(`📤 Full Mobile: ${fullMobile}`);

      // ✅ Call MSG91 Widget API - NO DEMO FLAG
      const response = await axios.post(
        `${this.baseUrl}/otp`,
        {
          widget_id: this.widgetId,
          token_auth: this.tokenAuth,
          identifier: fullMobile
          // ❌ NO is_demo flag - LIVE SMS will be sent
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
        console.log('✅ OTP sent via MSG91 Widget');
        return { 
          success: true, 
          data: response.data,
          orderId: response.data.order_id,
          method: 'widget',
          // ✅ MSG91 returns the OTP in response
          otp: response.data.otp || null
        };
      }

      // ✅ If Widget fails, try Direct SMS as fallback
      console.log('⚠️ Widget API failed, trying Direct SMS...');
      return await this._sendDirectSMS(mobile);

    } catch (error) {
      console.error('❌ MSG91 Error:', error.message);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', error.response.data);
      }
      
      // ✅ Try Direct SMS as fallback
      let mobile = this._cleanPhoneNumber(phoneNumber);
      if (mobile) {
        console.log('🔄 Trying Direct SMS fallback...');
        return await this._sendDirectSMS(mobile);
      }
      
      return { success: false, error: error.message };
    }
  }

  /**
   * ✅ Direct SMS (Fallback)
   */
  async _sendDirectSMS(mobile) {
    try {
      console.log(`📤 Direct SMS to: 91${mobile}`);

      // ✅ Generate OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      console.log(`🔑 OTP: ${otp}`);

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

      if (response.data && response.data.type === 'success') {
        return { 
          success: true, 
          data: response.data,
          otp: otp,
          method: 'direct'
        };
      }

      return { success: false, error: response.data?.message || 'SMS failed' };

    } catch (error) {
      console.error('❌ Direct SMS Error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * ✅ Verify OTP
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
        return { success: true, data: response.data, verified: true };
      }

      return { success: false, error: response.data?.message || 'Invalid OTP' };

    } catch (error) {
      console.error('❌ Verify Error:', error.message);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', error.response.data);
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * ✅ Resend OTP
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
          return { success: true, data: response.data };
        }
      } catch (widgetError) {
        console.log('⚠️ Widget resend failed:', widgetError.message);
      }

      // ✅ Fallback: Direct SMS
      console.log('🔄 Trying Direct SMS resend...');
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      const directResult = await this._sendDirectSMS(mobile);
      
      if (directResult.success) {
        return { 
          success: true, 
          data: directResult.data,
          otp: otp
        };
      }

      return { success: false, error: 'Failed to resend OTP' };

    } catch (error) {
      console.error('❌ Resend Error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * ✅ Clean phone number
   */
  _cleanPhoneNumber(phone) {
    if (!phone) return null;
    
    let clean = phone.replace(/\s/g, '');
    
    if (clean.startsWith('+91')) {
      clean = clean.substring(3);
    } else if (clean.startsWith('91')) {
      clean = clean.substring(2);
    } else if (clean.startsWith('0')) {
      clean = clean.substring(1);
    }
    
    if (!/^[0-9]{10}$/.test(clean)) {
      console.error(`❌ Invalid phone: ${clean}`);
      return null;
    }
    
    return clean;
  }
}

module.exports = new MSG91Service();