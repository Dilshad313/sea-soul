// services/msg91Service.js - MSG91 Widget Direct
const axios = require('axios');
require('dotenv').config();

class MSG91Service {
  constructor() {
    // ✅ Only 3 credentials
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

  // ✅ Send OTP - MSG91 handles demo internally
  async sendOTP(phoneNumber) {
    try {
      console.log(`📤 Sending OTP to ${phoneNumber}...`);

      let mobile = this._cleanPhoneNumber(phoneNumber);
      if (!mobile) {
        return { success: false, error: 'Invalid phone number' };
      }

      const response = await axios.post(
        `${this.baseUrl}/otp`,
        {
          widget_id: this.widgetId,
          token_auth: this.tokenAuth,
          identifier: `91${mobile}`
        },
        {
          headers: {
            'authkey': this.authKey,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      console.log('📥 MSG91 Response:', response.data);

      if (response.data && response.data.success === true) {
        return { 
          success: true, 
          data: response.data,
          orderId: response.data.order_id
        };
      }

      return { success: false, error: response.data?.message || 'Failed' };

    } catch (error) {
      console.error('❌ MSG91 Error:', error.message);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', error.response.data);
      }
      return { success: false, error: error.message };
    }
  }

  // ✅ Verify OTP
  async verifyOTP(phoneNumber, otp) {
    try {
      console.log(`🔍 Verifying OTP for ${phoneNumber}...`);

      let mobile = this._cleanPhoneNumber(phoneNumber);
      if (!mobile) {
        return { success: false, error: 'Invalid phone number' };
      }

      const response = await axios.post(
        `${this.baseUrl}/otp/verify`,
        {
          widget_id: this.widgetId,
          token_auth: this.tokenAuth,
          identifier: `91${mobile}`,
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
      return { success: false, error: error.message };
    }
  }

  // ✅ Resend OTP
  async resendOTP(phoneNumber) {
    try {
      console.log(`📤 Resending OTP to ${phoneNumber}...`);

      let mobile = this._cleanPhoneNumber(phoneNumber);
      if (!mobile) {
        return { success: false, error: 'Invalid phone number' };
      }

      const response = await axios.post(
        `${this.baseUrl}/otp/resend`,
        {
          widget_id: this.widgetId,
          token_auth: this.tokenAuth,
          identifier: `91${mobile}`
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
        return { success: true, data: response.data };
      }

      return { success: false, error: response.data?.message || 'Failed' };

    } catch (error) {
      console.error('❌ Resend Error:', error.message);
      return { success: false, error: error.message };
    }
  }

  _cleanPhoneNumber(phone) {
    if (!phone) return null;
    
    let clean = phone.replace(/\s/g, '');
    if (clean.startsWith('+91')) clean = clean.substring(3);
    else if (clean.startsWith('91')) clean = clean.substring(2);
    else if (clean.startsWith('0')) clean = clean.substring(1);
    
    if (!/^[0-9]{10}$/.test(clean)) {
      console.error(`❌ Invalid phone: ${clean}`);
      return null;
    }
    
    return clean;
  }
}

module.exports = new MSG91Service();