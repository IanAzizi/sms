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

app.use('/api/contracts', contractRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5005;

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected');

    const now = new Date();
    const contracts = await Contract.find({ dueDate: { $gte: now } });

    contracts.forEach(contract => {
      scheduleReminders(contract);
    });

    console.log(`✅ All future reminders scheduled (${contracts.length})`);

    app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
  })
  .catch(err => console.error('❌ MongoDB connection failed:', err));
