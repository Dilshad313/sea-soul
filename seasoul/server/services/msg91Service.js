// services/msg91Service.js - COMPLETE WORKING WITH WIDGET
const axios = require('axios');
require('dotenv').config();

class MSG91Service {
  constructor() {
    this.authKey = process.env.MSG91_AUTH_KEY;
    this.widgetId = process.env.MSG91_WIDGET_ID;
    this.tokenAuth = process.env.MSG91_TOKEN_AUTH;
    this.baseUrl = 'https://api.msg91.com/api/v5';
    
    console.log('========================================');
    console.log('🔧 MSG91 Service Initialized');
    console.log(`📌 Widget ID: ${this.widgetId ? '✅' : '❌'}`);
    console.log(`📌 Token Auth: ${this.tokenAuth ? '✅' : '❌'}`);
    console.log(`📌 Auth Key: ${this.authKey ? '✅' : '❌'}`);
    console.log('========================================');
  }

  /**
   * ✅ Send OTP via Widget API - PRIMARY METHOD
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

      // ✅ Generate 4-digit OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      console.log(`🔑 OTP: ${otp}`);

      // ✅ Widget API Call
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

      console.log('📥 Widget Response:', {
        status: response.status,
        data: response.data
      });

      // ✅ Check Widget API response
      if (response.data && response.data.success === true) {
        console.log(`✅ OTP sent via Widget! Order ID: ${response.data.order_id}`);
        console.log(`🔑 OTP: ${otp}`);
        return { 
          success: true, 
          data: response.data,
          orderId: response.data.order_id,
          otp: otp,
          method: 'widget'
        };
      }

      // ✅ If Widget returns error but says success is false
      if (response.data && response.data.success === false) {
        console.log('⚠️ Widget API returned error:', response.data.message);
        // Don't fallback - let it fail so we know
        return { 
          success: false, 
          error: response.data.message || 'Widget API failed',
          data: response.data
        };
      }

      // ✅ If no response data
      return { success: false, error: 'No response from Widget API' };

    } catch (error) {
      console.error('❌ Widget API Error:', error.message);
      
      // Log detailed error
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', error.response.data);
        
        // ✅ If widget fails, try Direct SMS as fallback
        console.log('🔄 Widget failed, trying Direct SMS fallback...');
        let mobile = this._cleanPhoneNumber(phoneNumber);
        if (mobile) {
          const otp = Math.floor(1000 + Math.random() * 9000).toString();
          return await this._sendDirectSMS(mobile, otp);
        }
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
            sender: 'SEASOUL',
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
      console.log(`📤 Resending OTP to ${phoneNumber}...`);

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
      } catch (error) {
        console.log('⚠️ Widget resend failed:', error.message);
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