require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const contactRoutes = require('./routes/contactRoutes');
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files securely alongside API
const path = require('path');
app.use(express.static(path.join(__dirname, '../')));

// API Routes
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/admin', adminRoutes);

// Wildcard route to serve index.html for unknown paths (SPA fallback)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'API is running smoothly!' });
});

// Database Connection
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/finpulse';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✓ Connected to MongoDB Successfully');
    app.listen(PORT, () => console.log(`✓ Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('✗ MongoDB connection error. Ensure MongoDB is running or MONGO_URI is set.');
    console.error(err.message);
  });
