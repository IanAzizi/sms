const express = require('express');
const router = express.Router();
const Contract = require('../models/Contract');
const auth = require('../middleware/authMiddleware');
const scheduleReminders = require('../utils/scheduleReminders'); // 👈 اگه داری

// ➜ POST: ساخت قرارداد جدید + برنامه‌ریزی SMS
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

    // 🔑 اینجا باید برنامه‌ریزی SMS رو فعال کنی
    scheduleReminders(contract); // اگه این تابع رو درست نوشتی

    res.json({ message: '✅ قرارداد ثبت شد', contract });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در ثبت قرارداد' });
  }
});

// ➜ GET: دریافت همه قراردادهای فعال (جدیدترین بالا)
router.get('/', auth, async (req, res) => {
  const contracts = await Contract.find({
    user: req.userId,
    archived: false
  }).sort({ createdAt: -1 }); // 🔑 جدیدترین بالا
  res.json(contracts);
});

// ➜ PATCH: آرشیو کردن قرارداد
router.patch('/:id/archive', auth, async (req, res) => {
  try {
    const contract = await Contract.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { archived: true },
      { new: true }
    );
    if (!contract) return res.status(404).json({ error: 'قرارداد پیدا نشد' });
    res.json({ message: '✅ قرارداد بایگانی شد', contract });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در بایگانی' });
  }
});

module.exports = router;
