const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const QueueEntry = require('../models/QueueEntry');
const { protect } = require('../middleware/auth');

// Get all transactions
router.get('/', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({}).sort('-timestamp');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete a service (creates transaction, removes from queue)
router.post('/complete/:queueId', protect, async (req, res) => {
  const { amountCharged } = req.body;
  try {
    const entry = await QueueEntry.findById(req.params.queueId).populate('service');
    if (!entry) return res.status(404).json({ message: 'Queue entry not found' });

    const transaction = new Transaction({
      customerName: entry.customerName,
      serviceName: entry.service.name,
      amountCharged: amountCharged || entry.service.price,
      status: 'completed',
    });

    await transaction.save();
    await entry.deleteOne();

    req.io.emit('queue_updated');
    req.io.emit('dashboard_updated');

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel a service (creates transaction with 0 amount, removes from queue)
router.post('/cancel/:queueId', protect, async (req, res) => {
  const { cancelReason } = req.body;
  try {
    const entry = await QueueEntry.findById(req.params.queueId).populate('service');
    if (!entry) return res.status(404).json({ message: 'Queue entry not found' });

    const transaction = new Transaction({
      customerName: entry.customerName,
      serviceName: entry.service.name,
      amountCharged: 0,
      status: 'cancelled',
      cancelReason: cancelReason || 'Other',
    });

    await transaction.save();
    await entry.deleteOne();

    req.io.emit('queue_updated');
    req.io.emit('dashboard_updated');

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Dashboard stats
router.get('/stats', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const transactions = await Transaction.find({ timestamp: { $gte: today } });
    
    const todaysRevenue = transactions
      .filter(t => t.status === 'completed')
      .reduce((acc, t) => acc + t.amountCharged, 0);
      
    const completedServices = transactions.filter(t => t.status === 'completed').length;
    const cancelledServices = transactions.filter(t => t.status === 'cancelled').length;
    const totalCustomersToday = completedServices + cancelledServices;

    const pendingQueue = await QueueEntry.countDocuments({});

    res.json({
      todaysRevenue,
      totalCustomersToday,
      completedServices,
      cancelledServices,
      pendingCustomers: pendingQueue
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Analytics Chart Data
router.get('/analytics', protect, async (req, res) => {
  // Simple implementation: return last 7 days revenue
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const transactions = await Transaction.find({ 
      timestamp: { $gte: sevenDaysAgo },
      status: 'completed'
    });

    // Group by day
    const revenueByDay = {};
    const servicePopularity = {};

    transactions.forEach(t => {
      const day = new Date(t.timestamp).toLocaleDateString('en-US', { weekday: 'short' });
      revenueByDay[day] = (revenueByDay[day] || 0) + t.amountCharged;
      
      servicePopularity[t.serviceName] = (servicePopularity[t.serviceName] || 0) + 1;
    });

    res.json({
      revenueByDay: Object.keys(revenueByDay).map(k => ({ day: k, revenue: revenueByDay[k] })),
      servicePopularity: Object.keys(servicePopularity).map(k => ({ name: k, count: servicePopularity[k] }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
