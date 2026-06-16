const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { protect } = require('../middleware/auth');

// Get settings (Public, so frontend can display shop name)
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update settings (Admin only)
router.put('/', protect, async (req, res) => {
  try {
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = new Settings();
    }
    
    settings.shopName = req.body.shopName || settings.shopName;
    settings.currency = req.body.currency || settings.currency;
    if (req.body.businessHours) {
      settings.businessHours = req.body.businessHours;
    }

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
