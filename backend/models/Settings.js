const mongoose = require('mongoose');

const settingsSchema = mongoose.Schema({
  shopName: { type: String, default: 'TrimFlow Luxury Barbershop' },
  currency: { type: String, default: '$' },
  businessHours: {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '20:00' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
