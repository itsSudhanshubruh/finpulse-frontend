const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');

// Optional setup for Email (if env vars exist)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;
    
    // 1. Save submission to MongoDB
    const newContact = new Contact({ name, email, phone, service, message });
    await newContact.save();

    // 2. Optionally Send Notification Email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Send notification to admin
        subject: `New Consultation Request from ${name}`,
        text: `Service Needed: ${service}\nEmail: ${email}\nPhone: ${phone}\n\nMessage: ${message}`
      }).catch(err => console.error("Email failed to send, but data was saved.", err));
    }

    res.status(201).json({ success: true, message: 'Consultation request submitted successfully!' });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ success: false, message: 'Server error processing request.' });
  }
});

module.exports = router;
