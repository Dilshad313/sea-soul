const axios = require('axios');

class SMSService {
  constructor() {
    this.apiKey = process.env.MSG91_API_KEY;
    this.senderId = process.env.MSG91_SENDER_ID;
    this.templateId = process.env.MSG91_OTP_TEMPLATE_ID;  // ✅ This is correct
    this.baseUrl = 'https://api.msg91.com/api/v5';
  }

  async sendOTP(phoneNumber, otp) {
    try {
      let mobile = phoneNumber.replace(/\s/g, '');
      if (mobile.startsWith('+91')) mobile = mobile.substring(3);
      if (mobile.startsWith('91')) mobile = mobile.substring(2);

      console.log(`📤 Sending OTP...`);
      console.log(`📱 Mobile: ${mobile}`);
      console.log(`📋 Template ID: ${this.templateId}`);  // ✅ Check this

      const response = await axios.post(
        `${this.baseUrl}/otp`,
        {
          mobile: mobile,
          otp: otp,
          template_id: this.templateId,  // ✅ Template ID from .env
          sender: this.senderId,
        },
        {
          headers: {
            'authkey': this.apiKey,
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('✅ SMS Response:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ SMS Error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }
}

module.exports = new SMSService();