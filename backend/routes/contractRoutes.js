const express = require('express');
const router = express.Router();
const Contract = require('../models/Contract');
const auth = require('../middleware/authMiddleware');
const scheduleReminders = require('../utils/scheduleReminders');
const sendSMSPattern = require('../services/sendSMSPattern');

const moment = require('moment-jalaali');
moment.loadPersian({ dialect: 'persian-modern' });

// ➜ POST: Create new contract + schedule reminders + send immediate confirmation SMS
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

    // برنامه‌ریزی یادآورها
    scheduleReminders(contract);

    // تاریخ شمسی
    const m = moment(dueDate);
    const jdayName = m.format('dddd');    // مثلا سه‌شنبه
    const jmonthName = m.format('jMMMM'); // مثلا مرداد

    console.log('✅ Jalali:', jdayName, jmonthName);

    // پترن
    const patternCode = 1003;
    const textData = [jdayName, jmonthName];
    
    // ارسال اس‌ام‌اس پترنی
    const result = await sendSMSPattern(tenantPhone, patternCode, textData);
    console.log(`✅ Contract created & Pattern SMS sent | Response:`, result);

    res.status(201).json({
      message: '✅ Contract created & Pattern SMS sent',
      contract
    });

  } catch (err) {
    console.error('❌ Error creating contract:', err);
    res.status(500).json({ error: 'Error creating contract' });
  }
});

// ➜ GET: Get all active contracts
router.get('/', auth, async (req, res) => {
  try {
    const contracts = await Contract.find({
      user: req.userId,
      archived: false
    }).sort({ createdAt: -1 });

    res.json(contracts);
  } catch (err) {
    console.error('❌ Error fetching contracts:', err);
    res.status(500).json({ error: 'Error fetching contracts' });
  }
});

// ➜ PATCH: Archive contract
router.patch('/:id/archive', auth, async (req, res) => {
  try {
    const contract = await Contract.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { archived: true },
      { new: true }
    );

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    console.log(`✅ Contract archived | ContractID: ${contract._id}`);
    res.json({
      message: '✅ Contract archived',
      contract
    });
  } catch (err) {
    console.error('❌ Error archiving contract:', err);
    res.status(500).json({ error: 'Error archiving contract' });
  }
});

module.exports = router;
