const axios = require('axios');

class SMSService {
  constructor() {
    this.apiKey = process.env.MSG91_API_KEY;
    this.senderId = process.env.MSG91_SENDER_ID;
    this.templateId = process.env.MSG91_OTP_TEMPLATE_ID;
    this.baseUrl = 'https://api.msg91.com/api/v5';
  }

  // ✅ Fix: Ensure phone number has country code
  formatPhoneNumber(phoneNumber) {
    let mobile = phoneNumber.replace(/\s/g, '');
    
    // ✅ If number starts with +91, remove + and keep 91
    if (mobile.startsWith('+91')) {
      mobile = mobile.substring(3);
    }
    // ✅ If number starts with 91, keep as is
    else if (mobile.startsWith('91')) {
      mobile = mobile.substring(2);
    }
    // ✅ If number has 10 digits only, add 91
    else if (mobile.length === 10) {
      mobile = '91' + mobile;
    }
    // ✅ If number has 11 digits and starts with 0
    else if (mobile.length === 11 && mobile.startsWith('0')) {
      mobile = '91' + mobile.substring(1);
    }
    // ✅ If number has 12 digits and starts with 91
    else if (mobile.length === 12 && mobile.startsWith('91')) {
      // Already in correct format
    }
    // ✅ If number has 13 digits and starts with +91
    else if (mobile.length === 13 && mobile.startsWith('+91')) {
      mobile = mobile.substring(1);
    }
    
    console.log(`📱 Formatted Mobile: ${mobile}`);
    return mobile;
  }

  async sendOTP(phoneNumber, otp) {
    try {
      console.log(`📤 Sending OTP to ${phoneNumber}...`);
      
      // ✅ Format phone number correctly
      const mobile = this.formatPhoneNumber(phoneNumber);
      
      console.log(`📋 Template ID: ${this.templateId}`);
      console.log(`📝 Sender ID: ${this.senderId}`);

      // ✅ Send OTP via MSG91
      const response = await axios.post(
        `${this.baseUrl}/otp`,
        {
          mobile: mobile,  // ✅ Now in correct format: 91XXXXXXXXXX
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

      console.log('✅ MSG91 Response:', response.data);
      
      if (response.data.type === 'success') {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error('❌ SMS Error Details:');
      if (error.response) {
        console.error(`   - Status: ${error.response.status}`);
        console.error(`   - Data: ${JSON.stringify(error.response.data)}`);
      } else {
        console.error(`   - Message: ${error.message}`);
      }
      return { success: false, error: error.response?.data || error.message };
    }
  }
}

module.exports = new SMSService();