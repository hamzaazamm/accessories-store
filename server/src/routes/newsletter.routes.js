const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');

router.post('/subscribe', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const existing = await Newsletter.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.json({ success: true, message: 'You are already subscribed to our newsletter.' });
    }

    await Newsletter.create({ email: email.toLowerCase().trim() });
    res.status(201).json({
      success: true,
      message: 'Thank you for subscribing to the Gadget District newsletter!',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
