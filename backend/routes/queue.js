const express = require('express');
const router = express.Router();
const QueueEntry = require('../models/QueueEntry');
const Service = require('../models/Service');
const { protect } = require('../middleware/auth');

// Get active queue
router.get('/', async (req, res) => {
  try {
    const queue = await QueueEntry.find({}).populate('service').sort('joinTime');
    res.json(queue);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Join queue
router.post('/join', async (req, res) => {
  const { customerName, serviceId } = req.body;
  try {
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    // Calculate estimated wait time (simple logic: sum of durations of waiting/serving)
    const currentQueue = await QueueEntry.find({}).populate('service');
    let estimatedWaitTime = currentQueue.reduce((acc, entry) => acc + (entry.service?.duration || 0), 0);

    const entry = new QueueEntry({
      customerName,
      service: serviceId,
      estimatedWaitTime
    });

    const createdEntry = await entry.save();
    
    // Emit socket event
    req.io.emit('queue_updated');
    
    res.status(201).json(createdEntry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update status (Admin only) - e.g., move to 'serving'
router.put('/:id/status', protect, async (req, res) => {
  const { status } = req.body; // 'waiting' or 'serving'
  try {
    const entry = await QueueEntry.findById(req.params.id);
    if (entry) {
      entry.status = status;
      await entry.save();
      req.io.emit('queue_updated');
      res.json(entry);
    } else {
      res.status(404).json({ message: 'Queue entry not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove from queue without transaction (e.g. Cancelled)
router.delete('/:id', protect, async (req, res) => {
  try {
    const entry = await QueueEntry.findById(req.params.id);
    if (entry) {
      await entry.deleteOne();
      req.io.emit('queue_updated');
      res.json({ message: 'Queue entry removed' });
    } else {
      res.status(404).json({ message: 'Queue entry not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
