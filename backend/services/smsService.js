const axios = require('axios');
const qs = require('qs'); // برای ساختن کوئری URL Encoded

module.exports = async function sendSMS(to, text) {
  try {
    const response = await axios.post(
      process.env.NABZKAR_URL,
      qs.stringify({
        action: 'send',
        from: 'auto',
        text: text,
        receivers: to
      }),
      {
        headers: {
          Authorization: process.env.NABZKAR_API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    console.log('SMS sent:', response.data);
  } catch (err) {
    console.error('SMS Error:', err.response?.data || err.message);
  }
};
