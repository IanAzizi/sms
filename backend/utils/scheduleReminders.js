const cron = require('node-cron');
const sendSMS = require('../services/smsService');

module.exports = function (contract) {
  if (!contract.dueDate) {
    console.error(`❌ Contract ${contract._id} has no dueDate, skipping reminders`);
    return;
  }

  if (!contract.checkNumber) {
    console.error(`❌ Contract ${contract._id} has no checkNumber, skipping reminders`);
    return;
  }

  const dueDate = new Date(contract.dueDate);
  if (isNaN(dueDate)) {
    console.error(`❌ Invalid dueDate for contract ${contract._id}: ${contract.dueDate}`);
    return;
  }

  const reminders = [
    { daysBefore: 10, text: `۱۰ روز مانده تا سررسید چک ${contract.checkNumber}` },
    { daysBefore: 5, text: `۵ روز مانده تا سررسید چک ${contract.checkNumber}` },
    { daysBefore: 3, text: `۳ روز مانده تا سررسید چک ${contract.checkNumber}` },
    { daysAfter: 1, text: `چک شما پاس نشده است، لطفا به واحد مالی بندرعباس مال مراجعه فرمایید.` }
  ];

  reminders.forEach(reminder => {
    let targetDate = new Date(dueDate);

    if (reminder.daysBefore) {
      targetDate.setDate(dueDate.getDate() - reminder.daysBefore);
    } else if (reminder.daysAfter) {
      targetDate.setDate(dueDate.getDate() + reminder.daysAfter);
    }

    if (isNaN(targetDate)) {
      console.error(`❌ Invalid targetDate for reminder: ${reminder.text}`);
      return;
    }

    // کرون تایم دقیق
    const cronTime = `${targetDate.getMinutes()} ${targetDate.getHours()} ${targetDate.getDate()} ${targetDate.getMonth() + 1} *`;

    console.log(`✅ Scheduling cron: ${cronTime} => ${reminder.text}`);

    cron.schedule(cronTime, () => {
      console.log(`📤 Sending SMS to ${contract.tenantPhone}: ${reminder.text}`);
      sendSMS(contract.tenantPhone, reminder.text);
    });
  });
};
