const axios = require('axios');

class SMSService {
  constructor() {
    this.apiKey = process.env.MSG91_API_KEY;
    this.senderId = process.env.MSG91_SENDER_ID;
    this.templateId = process.env.MSG91_OTP_TEMPLATE_ID;
    this.baseUrl = 'https://api.msg91.com/api';
    
    console.log('🔍 MSG91 Config Check:');
    console.log(`   API Key: ${this.apiKey ? '✅ Present' : '❌ Missing'}`);
    console.log(`   Sender ID: ${this.senderId || '❌ Missing'}`);
    console.log(`   Template ID: ${this.templateId || '❌ Missing'}`);
  }

  async sendOTP(phoneNumber, otp) {
    try {
      console.log(`📤 Sending OTP to ${phoneNumber}...`);
      
      // ✅ Clean phone number
      let mobile = phoneNumber.replace(/\s/g, '');
      if (mobile.startsWith('+91')) mobile = mobile.substring(3);
      if (mobile.startsWith('91')) mobile = mobile.substring(2);
      
      if (mobile.length !== 10) {
        console.error(`❌ Invalid phone: ${mobile}`);
        return { success: false, error: 'Invalid phone number' };
      }

      console.log(`📱 Clean Mobile: ${mobile}`);
      console.log(`📝 Sender: ${this.senderId}`);
      console.log(`📋 Template ID: ${this.templateId}`);

      // ✅ Create message
      const message = `Your OTP for SeaSoul is ${otp}. Valid for 10 minutes.`;

      // ✅ Build URL with all parameters
      const url = `${this.baseUrl}/sendhttp.php`;
      const params = {
        authkey: this.apiKey,
        mobiles: `91${mobile}`,
        message: message,
        sender: this.senderId,
        route: '1',  // ✅ Promotional route (works without template)
        country: '91',
        response: 'json'
      };

      console.log('📤 Sending request to MSG91...');
      console.log('📤 URL:', url);
      console.log('📤 Params:', JSON.stringify(params, null, 2));

      const response = await axios.get(url, { params });

      console.log('📥 MSG91 Response:', response.data);

      // ✅ Parse response
      if (typeof response.data === 'string') {
        // ✅ If response is string, check for SUCCESS
        if (response.data.includes('SUCCESS')) {
          console.log('✅ SMS sent successfully!');
          return { success: true, data: response.data };
        } else if (response.data.includes('ERROR')) {
          console.error('❌ SMS Error:', response.data);
          return { success: false, error: response.data };
        }
      } else if (response.data && response.data.type === 'success') {
        console.log('✅ SMS sent successfully!');
        return { success: true, data: response.data };
      }

      console.error('❌ Unknown response:', response.data);
      return { success: false, error: response.data || 'Unknown error' };
      
    } catch (error) {
      console.error('❌ SMS Error Details:');
      console.error('   Message:', error.message);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', error.response.data);
      }
      return { 
        success: false, 
        error: error.response?.data || error.message 
      };
    }
  }

  // ✅ Alternative: Use POST method
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
      formData.append('route', '1');
      formData.append('country', '91');
      formData.append('response', 'json');

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
      
      if (response.data && response.data.type === 'success') {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.data };
      }
    } catch (error) {
      console.error('❌ SMS Error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new SMSService();