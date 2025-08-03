const cron = require('node-cron');
const moment = require('moment-jalaali');
const sendSMSPattern = require('../services/sendSMSPattern');

moment.loadPersian({ dialect: 'persian-modern' });

const sentFlags = new Set();

module.exports = function scheduleReminders(contract) {
  if (!contract.dueDate) return;

  const dueDate = new Date(contract.dueDate);
  if (isNaN(dueDate)) return;

  const reminders = [
    { daysBefore: 10, code: 1010 },
    { daysBefore: 5, code: 1011 },
    { daysBefore: 3, code: 1012 },
  ];

  reminders.forEach(reminder => {
    const targetDate = new Date(dueDate);
    targetDate.setDate(targetDate.getDate() - reminder.daysBefore);

    // ساعت و دقیقه اجرای SMS در زمان محلی
    const sendHourLocal = 12;   // 12 ظهر
    const sendMinuteLocal = 50;

    // UTC دقیق تنظیم کن
    const localHour = sendHourLocal;
    targetDate.setHours(localHour);
    targetDate.setMinutes(sendMinuteLocal);
    targetDate.setSeconds(0);
    targetDate.setMilliseconds(0);

    const now = new Date();
    if (targetDate <= now) {
      console.log(`⏭️ Skipped expired | ${contract.checkNumber} | ${reminder.code}`);
      return;
    }

    // Cron هم در Local تعریف کن نه UTC
    const cronTime = `${sendMinuteLocal} ${localHour} ${targetDate.getDate()} ${targetDate.getMonth() + 1} *`;
    const flagKey = `${contract._id}-${reminder.code}`;

    cron.schedule(cronTime, async () => {
      if (sentFlags.has(flagKey)) return;

      const m = moment(targetDate);
      const jDay = m.format('dddd');
      const jMonth = m.format('jMMMM');
      const textData = [jDay, jMonth];

      try {
        await sendSMSPattern(contract.tenantPhone, reminder.code, textData);
        sentFlags.add(flagKey);
        console.log(`✅ SMS sent | ${contract.checkNumber} | ${jDay} ${jMonth} | Pattern ${reminder.code}`);
      } catch (err) {
        console.error(`❌ SMS failed | ${flagKey} |`, err);
      }
    });

    console.log(`⏰ Reminder scheduled | ${contract.checkNumber} | Pattern ${reminder.code} | Runs at: ${targetDate.toString()}`);
  });
};
