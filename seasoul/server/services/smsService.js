const axios = require('axios');

class SMSService {
  constructor() {
    // ✅ Load environment variables
    this.apiKey = process.env.MSG91_API_KEY;
    this.senderId = process.env.MSG91_SENDER_ID;
    this.templateId = process.env.MSG91_OTP_TEMPLATE_ID;
    
    // ✅ Use old API (works with 6a570... template ID)
    this.baseUrl = 'https://api.msg91.com/api';
    
    console.log('🔍 MSG91 Config:');
    console.log(`   API Key: ${this.apiKey ? '✅ Present' : '❌ Missing'}`);
    console.log(`   Sender ID: ${this.senderId || '❌ Missing'}`);
    console.log(`   Template ID: ${this.templateId || '❌ Missing'}`);
  }

  // ✅ Send OTP via MSG91 - OLD API (Works with 6a570... template)
  async sendOTP(phoneNumber, otp) {
    try {
      console.log(`📤 Sending OTP to ${phoneNumber}...`);
      
      // ✅ Clean phone number
      let mobile = phoneNumber.replace(/\s/g, '');
      if (mobile.startsWith('+91')) mobile = mobile.substring(3);
      if (mobile.startsWith('91')) mobile = mobile.substring(2);
      
      // ✅ Ensure 10 digits
      if (mobile.length !== 10) {
        console.error(`❌ Invalid phone number: ${mobile}`);
        return { success: false, error: 'Invalid phone number' };
      }

      console.log(`📱 Mobile: ${mobile}`);
      console.log(`📝 Sender: ${this.senderId}`);
      console.log(`📋 Template ID: ${this.templateId}`);

      // ✅ Method 1: Send OTP using old API
      const message = `Your OTP for SeaSoul is ${otp}. Valid for 10 minutes.`;
      
      const response = await axios.get(
        `${this.baseUrl}/sendhttp.php`,
        {
          params: {
            authkey: this.apiKey,
            mobiles: `91${mobile}`,
            message: message,
            sender: this.senderId,
            route: '4',  // Transactional route
            country: '91',
            DLT_TE_ID: this.templateId,  // ✅ Template ID for DLT
          }
        }
      );

      console.log('📥 MSG91 Response:', response.data);
      
      // ✅ Check response
      if (response.data && response.data.includes('SUCCESS')) {
        console.log('✅ SMS sent successfully!');
        return { success: true, data: response.data };
      } else {
        console.error('❌ SMS failed:', response.data);
        return { success: false, error: response.data };
      }
    } catch (error) {
      console.error('❌ SMS Error:', error.message);
      if (error.response) {
        console.error('   Response:', error.response.data);
      }
      return { success: false, error: error.message };
    }
  }

  // ✅ Method 2: Alternative using POST
  async sendOTPPost(phoneNumber, otp) {
    try {
      console.log(`📤 Sending OTP via POST to ${phoneNumber}...`);
      
      let mobile = phoneNumber.replace(/\s/g, '');
      if (mobile.startsWith('+91')) mobile = mobile.substring(3);
      if (mobile.startsWith('91')) mobile = mobile.substring(2);

      const message = `Your OTP for SeaSoul is ${otp}. Valid for 10 minutes.`;

      const formData = new URLSearchParams();
      formData.append('authkey', this.apiKey);
      formData.append('mobiles', `91${mobile}`);
      formData.append('message', message);
      formData.append('sender', this.senderId);
      formData.append('route', '4');
      formData.append('country', '91');
      formData.append('DLT_TE_ID', this.templateId);

      const response = await axios.post(
        `${this.baseUrl}/sendhttp.php`,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        }
      );

      console.log('📥 MSG91 Response:', response.data);
      
      if (response.data && response.data.includes('SUCCESS')) {
        console.log('✅ SMS sent successfully!');
        return { success: true, data: response.data };
      } else {
        console.error('❌ SMS failed:', response.data);
        return { success: false, error: response.data };
      }
    } catch (error) {
      console.error('❌ SMS Error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new SMSService();