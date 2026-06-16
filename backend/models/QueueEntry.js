const mongoose = require('mongoose');

const queueEntrySchema = mongoose.Schema({
  customerName: { type: String, required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  status: { type: String, enum: ['waiting', 'serving'], default: 'waiting' },
  joinTime: { type: Date, default: Date.now },
  estimatedWaitTime: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('QueueEntry', queueEntrySchema);
