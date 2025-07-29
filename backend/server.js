require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const contractRoutes = require('./routes/contractRoutes');
const authRoutes = require('./routes/authRoutes');
const scheduleReminders = require('./utils/scheduleReminders');
const Contract = require('./models/Contract');

const app = express();
app.use(express.json());
app.use(cors({
  origin: '*',
  exposedHeaders: ['Authorization']
}));

// Routes
app.use('/api/contracts', contractRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5005;

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected');

    // بعد از اتصال دیتابیس
    const contracts = await Contract.find();

contracts.forEach(contract => {
  scheduleReminders(contract);
  console.log(`📤 Reminder scheduled | To: ${contract.tenantPhone} | Check: ${contract.checkNumber} | Contract: ${contract._id}`);
});


    console.log('✅ All reminders scheduled on server start.');

    // بعدش سرور بالا بیاد
    app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
  })
  .catch(err => console.error('❌ MongoDB connection failed:', err));
