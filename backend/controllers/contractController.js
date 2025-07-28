const Contract = require('../models/Contract');
const scheduleReminders = require('../utils/scheduleReminders');

exports.createContract = async (req, res) => {
  try {
    const contract = await Contract.create(req.body);

    // زمان‌بندی پیام‌ها
    scheduleReminders(contract);

    res.status(201).json(contract);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getContracts = async (req, res) => {
  try {
    const contracts = await Contract.find();
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
