// backend/models/Contract.js
const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  tenantName: String,
  tenantPhone: String,
  checkNumber: String,
  amount: Number,
  dueDate: Date,
  archived: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true  // 🔑 این کلیدیه برای sort
});

module.exports = mongoose.model('Contract', contractSchema);
