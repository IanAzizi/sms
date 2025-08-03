const Contract = require('../models/Contract');
const scheduleReminders = require('../utils/scheduleReminders');

exports.createContract = async (req, res) => {
  try {
    const contract = await Contract.create({
      ...req.body,
      user: req.userId // یادت نره کاربر رو ست کنی
    });

    scheduleReminders(contract);

    console.log(`✅ New contract: Check#${contract.checkNumber} | Due: ${contract.dueDate}`);

    res.status(201).json(contract);
  } catch (err) {
    console.error('❌ Create contract error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getContracts = async (req, res) => {
  try {
    const contracts = await Contract.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(contracts);
  } catch (err) {
    console.error('❌ Get contracts error:', err);
    res.status(500).json({ error: err.message });
  }
};
