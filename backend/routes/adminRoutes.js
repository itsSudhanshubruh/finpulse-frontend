const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AuthLog = require('../models/AuthLog');
const Blog = require('../models/Blog');
const { protectAdmin } = require('../middleware/authMiddleware');

// @route   GET /api/admin/dashboard
// @desc    Get dashboard stats and activities
// @access  Private Admin
router.get('/dashboard', protectAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBlogs = await Blog.countDocuments();
    const recentActivities = await AuthLog.find({}).sort({ timestamp: -1 }).limit(50);
    
    // Calculate clients vs admins
    const totalClients = await User.countDocuments({ role: 'client' });
    const totalAdmins = totalUsers - totalClients;
    
    res.json({
      stats: {
        totalUsers,
        totalBlogs,
        totalClients,
        totalAdmins
      },
      activities: recentActivities
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching dashboard stats' });
  }
});

// @route   GET /api/admin/clients
// @desc    Get all VIP assigned Clients
// @access  Private Admin
router.get('/clients', protectAdmin, async (req, res) => {
  try {
    const clients = await User.find({ role: 'client', clientId: { $exists: true } }).sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching clients' });
  }
});

// @route   POST /api/admin/clients/create
// @desc    Create a new client with a predefined clientId
// @access  Private Admin
router.post('/clients/create', protectAdmin, async (req, res) => {
  try {
    const { name, password, email } = req.body;
    
    // Generate standard 6 character firm string
    const generatedId = 'FNC-' + Math.floor(1000 + Math.random() * 9000);
    
    const userPayload = {
      name,
      password,
      clientId: generatedId,
      role: 'client'
    };
    
    if (email && email.trim() !== '') {
        const uE = await User.findOne({ email });
        if(uE) return res.status(400).json({ message: 'Given email is already active' });
        userPayload.email = email;
    }
    
    const newClient = await User.create(userPayload);
    
    res.status(201).json({
      _id: newClient._id,
      name: newClient.name,
      clientId: newClient.clientId,
      email: newClient.email
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error generating client account. Verify sparse indexing.' });
  }
});

// @route   PUT /api/admin/clients/:id
// @desc    Update an existing client's password
// @access  Private Admin
router.put('/clients/:id', protectAdmin, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const client = await User.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Since User.js securely hashes passions on '.save()', we just assign it directly
    client.password = password;
    await client.save();

    res.json({ message: 'Client password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating client password' });
  }
});

module.exports = router;
