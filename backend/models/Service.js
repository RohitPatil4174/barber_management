const mongoose = require('mongoose');

const serviceSchema = mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true }, // in minutes
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
