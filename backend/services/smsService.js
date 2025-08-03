// backend/services/smsService.js
const axios = require('axios');
const qs = require('qs');

module.exports = async function sendSMSPattern(to, patternCode, patternData = []) {
  try {
    const body = {
      action: 'sendServices',
      from: 'auto',
      textCode: patternCode,
      receivers: to,
    //  trySend: 2
    };

    // فقط اگر patternData داشته باشیم اضافه کنیم
    if (patternData.length > 0) {
      body.textData = patternData;
    }

    const response = await axios.post(
      process.env.MYDNS_API_URL,
      qs.stringify(body),
      {
        headers: {
          Authorization: process.env.MYDNS_API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    console.log(`✅ Pattern SMS sent | Code: ${patternCode} | To: ${to}`, response.data);
  } catch (err) {
    console.error('❌ Pattern SMS Error:', err.response?.data || err.message);
  }
};
