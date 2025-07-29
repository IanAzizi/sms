const cron = require('node-cron');
const moment = require('moment-jalaali');
const sendSMSPattern = require('../services/sendSMSPattern');

moment.loadPersian({ dialect: 'persian-modern' });

const sentContracts = new Set(); // ذخیره قراردادهایی که پیام‌شون فرستاده شده

module.exports = function scheduleDueDateSMS(contract) {
  if (!contract.dueDate) {
    console.error(`❌ No dueDate for contract ${contract._id}`);
    return;
  }

  const dueDate = new Date(contract.dueDate);
  if (isNaN(dueDate)) {
    console.error(`❌ Invalid dueDate for contract ${contract._id}: ${contract.dueDate}`);
    return;
  }

  // کلید یکتا برای این قرارداد
  const key = contract._id.toString();

  // اگر قبلا پیام ارسال شده باشه، کاری نکن
  if (sentContracts.has(key)) {
    console.log(`⚠️ SMS already sent for contract ${key}, skipping.`);
    return;
  }

  // کرون تایم دقیق برای سررسید
  const cronTime = `${dueDate.getMinutes()} ${dueDate.getHours()} ${dueDate.getDate()} ${dueDate.getMonth() + 1} *`;

  console.log(`⏰ Scheduling single dueDate SMS | Cron: ${cronTime} | Contract: ${key}`);

  cron.schedule(cronTime, async () => {
    // قبل ارسال، چک کنیم باز هم ارسال نشده باشه
    if (sentContracts.has(key)) {
      console.log(`⚠️ SMS already sent for contract ${key}, skipping inside cron.`);
      return;
    }

    const m = moment(dueDate);
    const jDay = m.format('dddd');    // روز جلالی مثل شنبه
    const jMonth = m.format('jMMMM'); // ماه جلالی مثل مرداد

    const textCode = 1003;
    const textData = [`تاریخ سررسید: ${jDay} ${jMonth}`]; // مثلا متن قابل ارسال (بسته به پترن شما)

    console.log(`📤 Sending dueDate SMS | ${jDay} ${jMonth} | Contract ${key}`);

    try {
      await sendSMSPattern(contract.tenantPhone, textCode, textData);
      sentContracts.add(key); // ثبت ارسال پیام برای جلوگیری از ارسال دوباره
      console.log(`✅ SMS sent and marked as sent for contract ${key}`);
    } catch (err) {
      console.error(`❌ Error sending SMS for contract ${key}:`, err);
    }
  });
};
