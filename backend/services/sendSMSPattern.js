const axios = require('axios');
const qs = require('qs');

module.exports = async function sendSMSPattern(to, patternCode, textData = []) {
  try {
    if (!Array.isArray(textData)) {
      throw new Error('textData must be an array!');
    }

    const payload = {
      action: 'sendServices',
      from: 'auto',
      textCode: patternCode,
      receivers: to,
      trySend: 3
    };

    textData.forEach((val, idx) => {
      payload[`textData[${idx}]`] = val;
    });

    const response = await axios.post(
      process.env.NABZKAR_URL,
      qs.stringify(payload),
      {
        headers: {
          Authorization: process.env.NABZKAR_API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return response.data;

  } catch (err) {
    console.error('❌ Pattern SMS Error:', err.response?.data || err.message);
    throw err;
  }
};
