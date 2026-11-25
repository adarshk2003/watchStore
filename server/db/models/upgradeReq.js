// models/UpgradeRequest.js
const mongoose = require('mongoose');

const UpgradeRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  companyName: { type: String, required: true },
  license: { type: String, required: true },
  status: { type: String, default: 'pending' },
});

UpgradeRequestSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('UpgradeRequest', UpgradeRequestSchema);
