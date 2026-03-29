const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AuthLog = require('../models/AuthLog');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'finpulse_super_secret', {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ email, password });
    
    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if the input string is an email or a valid clientId natively
    const user = await User.findOne({ $or: [{ email: email }, { clientId: email }] });
    
    // Check if user exists and password is correct
    if (user && (await user.matchPassword(password))) {
      const loginIdentifier = user.email || user.clientId || 'Unknown ID';
      await AuthLog.create({ userId: user._id, email: loginIdentifier, role: user.role, action: 'login' });
      
      res.json({
        _id: user._id,
        email: user.email || '',
        clientId: user.clientId || '',
        name: user.name || 'Client',
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    const { email } = req.body;
    if (email) {
      const user = await User.findOne({ $or: [{ email: email }, { clientId: email }] });
      if (user) {
        const logoutIdentifier = user.email || user.clientId || 'Unknown ID';
        await AuthLog.create({ userId: user._id, email: logoutIdentifier, role: user.role, action: 'logout' });
      }
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during logout log' });
  }
});

module.exports = router;
