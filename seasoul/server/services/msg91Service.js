// services/msg91Service.js - COMPLETE WORKING WITH WIDGET
const axios = require('axios');
require('dotenv').config();

class MSG91Service {
  constructor() {
    // ✅ Widget credentials
    this.authKey = process.env.MSG91_AUTH_KEY;
    this.widgetId = process.env.MSG91_WIDGET_ID;
    this.tokenAuth = process.env.MSG91_TOKEN_AUTH;
    this.senderId = process.env.MSG91_SENDER_ID || 'SEASOUL';
    this.baseUrl = 'https://api.msg91.com/api/v5';
    
    console.log('========================================');
    console.log('🔧 MSG91 Service Initialized');
    console.log(`📌 Widget ID: ${this.widgetId ? '✅ Present' : '❌ Missing'}`);
    console.log(`📌 Token Auth: ${this.tokenAuth ? '✅ Present' : '❌ Missing'}`);
    console.log(`📌 Auth Key: ${this.authKey ? '✅ Present' : '❌ Missing'}`);
    console.log('========================================');
  }

  /**
   * ✅ Send OTP via MSG91 Widget - MAIN METHOD
   */
  async sendOTP(phoneNumber) {
    try {
      console.log('========================================');
      console.log('📤 MSG91 Widget: Sending OTP');
      console.log(`📱 Phone: ${phoneNumber}`);
      console.log('========================================');

      // Clean phone number
      let mobile = this._cleanPhoneNumber(phoneNumber);
      if (!mobile) {
        return { success: false, error: 'Invalid phone number' };
      }

      const fullMobile = `91${mobile}`;
      console.log(`📤 Full Mobile: ${fullMobile}`);

      // ✅ Step 1: Generate OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      console.log(`🔑 Generated OTP: ${otp}`);

      // ✅ Step 2: Send via Widget API with otp parameter
      const response = await axios.post(
        `${this.baseUrl}/otp`,
        {
          widget_id: this.widgetId,
          token_auth: this.tokenAuth,
          identifier: fullMobile,
          otp: otp  // ✅ Send OTP explicitly
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
        console.log(`✅ OTP sent via MSG91 Widget! OTP: ${otp}`);
        return { 
          success: true, 
          data: response.data,
          orderId: response.data.order_id,
          otp: otp,
          method: 'widget'
        };
      }

      // ✅ If Widget fails, try Direct SMS
      console.log('⚠️ Widget API failed, trying Direct SMS...');
      return await this._sendDirectSMS(mobile, otp);

    } catch (error) {
      console.error('❌ MSG91 Error:', error.message);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', error.response.data);
      }
      
      // ✅ Try Direct SMS as fallback
      let mobile = this._cleanPhoneNumber(phoneNumber);
      if (mobile) {
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        console.log('🔄 Trying Direct SMS fallback...');
        return await this._sendDirectSMS(mobile, otp);
      }
      
      return { success: false, error: error.message };
    }
  }

  /**
   * ✅ Direct SMS (Fallback)
   */
  async _sendDirectSMS(mobile, otp) {
    try {
      console.log(`📤 Direct SMS to: 91${mobile}`);
      console.log(`🔑 OTP: ${otp}`);

      const message = `Your SeaSoul verification code is ${otp}. Valid for 10 minutes.`;

      const response = await axios.get(
        'https://api.msg91.com/api/sendhttp.php',
        {
          params: {
            authkey: this.authKey,
            mobiles: `91${mobile}`,
            message: message,
            sender: this.senderId,
            route: '1',
            country: '91',
            response: 'json'
          },
          timeout: 30000
        }
      );

      console.log('📥 Direct SMS Response:', response.data);

      if (response.data && response.data.type === 'success') {
        console.log(`✅ SMS sent via Direct API! OTP: ${otp}`);
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

      // ✅ Verify via Widget API
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
      const otp = Math.floor(1000 + Math.random() * 9000).toString();

      // ✅ Try Widget API resend
      try {
        const response = await axios.post(
          `${this.baseUrl}/otp/resend`,
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

        console.log('📥 Resend Response:', response.data);

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

      // ✅ Fallback: Direct SMS
      console.log('🔄 Trying Direct SMS resend...');
      return await this._sendDirectSMS(mobile, otp);

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