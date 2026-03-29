const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: false, unique: true, sparse: true },
  clientId: { type: String, required: false, unique: true, sparse: true },
  name: { type: String, default: 'Client User' },
  password: { type: String, required: true },
  role: { type: String, default: 'client' }, // client or admin
  createdAt: { type: Date, default: Date.now }
});

// Hash the password before saving to the database
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to verify submitted password against hashed database password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
