const mongoose = require('mongoose');

const authLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email: { type: String, required: true },
  role: { type: String, enum: ['client', 'admin'], default: 'client' },
  action: { type: String, enum: ['login', 'logout'], required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuthLog', authLogSchema);
