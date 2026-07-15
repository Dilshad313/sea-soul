const axios = require('axios');

class SMSService {
  constructor() {
    this.apiKey = process.env.MSG91_API_KEY;
    this.senderId = process.env.MSG91_SENDER_ID;
    this.templateId = process.env.MSG91_OTP_TEMPLATE_ID;
    this.baseUrl = 'https://api.msg91.com/api/v5';
  }

  // ✅ Send OTP via SMS
  async sendOTP(phoneNumber, otp) {
    try {
      console.log(`📤 Sending OTP to ${phoneNumber} via MSG91...`);
      
      // ✅ Remove country code if present
      let mobile = phoneNumber.replace(/\s/g, '');
      if (mobile.startsWith('+91')) {
        mobile = mobile.substring(3);
      }
      if (mobile.startsWith('91')) {
        mobile = mobile.substring(2);
      }

      // ✅ Send OTP via MSG91
      const response = await axios.post(
        `${this.baseUrl}/otp`,
        {
          mobile: mobile,
          otp: otp,
          template_id: this.templateId,
          sender: this.senderId,
        },
        {
          headers: {
            'authkey': this.apiKey,
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('✅ SMS sent successfully:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ SMS Error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }
}

module.exports = new SMSService();