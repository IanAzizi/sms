const cron = require('node-cron');
const moment = require('moment-jalaali');
const sendSMSPattern = require('../services/sendSMSPattern');

moment.loadPersian({ dialect: 'persian-modern' });

const sentFlags = new Set(); // هر ارسال یکتا

module.exports = function scheduleReminders(contract) {
  if (!contract.dueDate) {
    console.error(`❌ No dueDate for contract ${contract._id}`);
    return;
  }

  const dueDate = new Date(contract.dueDate);
  if (isNaN(dueDate)) {
    console.error(`❌ Invalid dueDate for contract ${contract._id}`);
    return;
  }

  const reminders = [
    { daysBefore: 10, code: 1010 },
    { daysBefore: 5, code: 1011 },
    { daysBefore: 3, code: 1012 },
    { daysAfter: 0, code: 1003 } // روز سررسید
  ];

  reminders.forEach(reminder => {
    let targetDate = new Date(dueDate);
    if (reminder.daysBefore) {
      targetDate.setDate(dueDate.getDate() - reminder.daysBefore);
    } else if (reminder.daysAfter !== undefined) {
      targetDate.setDate(dueDate.getDate() + reminder.daysAfter);
    }

    const cronTime = `${targetDate.getMinutes()} ${targetDate.getHours()} ${targetDate.getDate()} ${targetDate.getMonth() + 1} *`;

    // کلید یکتا برای این هشدار
    const key = `${contract._id}-${reminder.code}`;

    console.log(`⏰ Scheduling SMS | Contract: ${contract._id} | Code: ${reminder.code} | When: ${targetDate} | Cron: ${cronTime}`);

    cron.schedule(cronTime, async () => {
      if (sentFlags.has(key)) {
        console.log(`⚠️ Already sent | Key: ${key}`);
        return;
      }

      const m = moment(targetDate);
      const jDay = m.format('dddd');
      const jMonth = m.format('jMMMM');

      const textCode = reminder.code;

      // فقط برای کد 1003 نیازی به دیتا نیست، بقیه پترن دارند
      let textData = [];
      if (textCode !== 1003) {
        textData = [jDay, jMonth];
      }

      console.log(`📤 Sending Pattern SMS | Code: ${textCode} | To: ${contract.tenantPhone} | ${jDay} ${jMonth}`);

      try {
        await sendSMSPattern(contract.tenantPhone, textCode, textData);
        sentFlags.add(key);
        console.log(`✅ Pattern SMS sent & flagged | Key: ${key}`);
      } catch (err) {
        console.error(`❌ Pattern SMS failed | Key: ${key}`, err);
      }
    });
  });
};
