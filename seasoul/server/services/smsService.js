const axios = require('axios');

class SMSService {
  constructor() {
    this.apiKey = process.env.MSG91_API_KEY;
    this.senderId = process.env.MSG91_SENDER_ID;
    this.baseUrl = 'https://api.msg91.com/api';
    
    console.log('🔍 MSG91 Config:');
    console.log(`   API Key: ${this.apiKey ? '✅ Present' : '❌ Missing'}`);
    console.log(`   Sender ID: ${this.senderId || '❌ Missing'}`);
  }

  async sendOTP(phoneNumber, otp) {
    try {
      console.log(`📤 Sending OTP to ${phoneNumber}...`);
      
      // ✅ Clean phone number
      let mobile = phoneNumber.replace(/\s/g, '');
      if (mobile.startsWith('+91')) {
        mobile = mobile.substring(3);
      } else if (mobile.startsWith('91')) {
        mobile = mobile.substring(2);
      }
      
      if (mobile.length !== 10) {
        console.error(`❌ Invalid phone: ${mobile}`);
        return { success: false, error: 'Invalid phone number' };
      }

      console.log(`📱 Mobile: ${mobile}`);
      console.log(`📝 Sender: ${this.senderId}`);

      // ✅ Create message
      const message = `Your OTP for SeaSoul is ${otp}. Valid for 10 minutes.`;

      // ✅ Send SMS - Only once!
      const response = await axios.get(
        `${this.baseUrl}/sendhttp.php`,
        {
          params: {
            authkey: this.apiKey,
            mobiles: `91${mobile}`,
            message: message,
            sender: this.senderId,
            route: '1',
            country: '91',
            response: 'json'
          }
        }
      );

      console.log('📥 MSG91 Response:', response.data);

      // ✅ Check response
      if (response.data && response.data.type === 'success') {
        console.log('✅ SMS sent successfully!');
        return { success: true, data: response.data };
      } else if (typeof response.data === 'string' && response.data.includes('SUCCESS')) {
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
}

module.exports = new SMSService();