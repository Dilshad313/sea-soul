const axios = require('axios');

class SMSService {
  constructor() {
    this.apiKey = process.env.MSG91_API_KEY;
    this.senderId = process.env.MSG91_SENDER_ID;
    this.templateId = process.env.MSG91_OTP_TEMPLATE_ID;
    // ✅ Use old API endpoint
    this.baseUrl = 'https://api.msg91.com/api';
  }

  async sendOTP(phoneNumber, otp) {
    try {
      console.log(`📤 Sending OTP to ${phoneNumber}...`);
      console.log(`📋 Template ID: ${this.templateId}`);

      let mobile = phoneNumber.replace(/\s/g, '');
      if (mobile.startsWith('+91')) mobile = mobile.substring(3);
      if (mobile.startsWith('91')) mobile = mobile.substring(2);

      // ✅ Use old API format
      const response = await axios.post(
        `${this.baseUrl}/sendhttp.php`,
        {
          authkey: this.apiKey,
          mobiles: `91${mobile}`,
          message: `Your OTP for SeaSoul is ${otp}. Valid for 10 minutes.`,
          sender: this.senderId,
          route: '4',
          country: '91',
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        }
      );

      console.log('✅ MSG91 Response:', response.data);
      
      // ✅ Check response
      if (response.data.includes('SUCCESS')) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.data };
      }
    } catch (error) {
      console.error('❌ SMS Error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }
}

module.exports = new SMSService();