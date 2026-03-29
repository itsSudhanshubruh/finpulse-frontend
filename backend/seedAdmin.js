// seedAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/finpulse';
    await mongoose.connect(MONGO_URI);
    
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@finpulse.com' });
    
    if (adminExists) {
      console.log('Admin already exists in database');
    } else {
      const adminUser = await User.create({
        email: 'admin@finpulse.com',
        password: 'adminpassword123', // Will be hashed by pre-save hook
        role: 'admin'
      });
      console.log('Admin seeded successfully: admin@finpulse.com');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin', error);
    process.exit(1);
  }
};

seedAdmin();
