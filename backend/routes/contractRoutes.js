const express = require('express');
const router = express.Router();
const Contract = require('../models/Contract');
const auth = require('../middleware/authMiddleware');
const scheduleReminders = require('../utils/scheduleReminders');

router.post('/', auth, async (req, res) => {
  const { tenantName, tenantPhone, checkNumber, amount, dueDate } = req.body;

  try {
    const contract = new Contract({
      tenantName,
      tenantPhone,
      checkNumber,
      amount,
      dueDate,
      user: req.userId
    });

    await contract.save();

    // فقط زمان‌بندی کن
    scheduleReminders(contract);

    console.log(`✅ New Contract | ${checkNumber} | ${dueDate}`);
    res.status(201).json({
      message: '✅ Contract created & reminders scheduled',
      contract
    });

  } catch (err) {
    console.error('❌ Error creating contract:', err);
    res.status(500).json({ error: 'Error creating contract' });
  }
});

module.exports = router;
