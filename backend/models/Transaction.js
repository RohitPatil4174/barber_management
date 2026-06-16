const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
  customerName: { type: String, required: true },
  serviceName: { type: String, required: true },
  amountCharged: { type: Number, required: true },
  status: { type: String, enum: ['completed', 'cancelled'], required: true },
  cancelReason: { type: String }, // e.g., 'Customer Left', 'Duplicate Entry'
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
