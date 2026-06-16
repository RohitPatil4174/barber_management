const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const { protect } = require('../middleware/auth');

// Get all services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find({});
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create service (Admin only)
router.post('/', protect, async (req, res) => {
  const { name, price, duration, description } = req.body;
  try {
    const service = new Service({ name, price, duration, description });
    const createdService = await service.save();
    res.status(201).json(createdService);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update service (Admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (service) {
      service.name = req.body.name || service.name;
      service.price = req.body.price || service.price;
      service.duration = req.body.duration || service.duration;
      service.description = req.body.description || service.description;
      const updatedService = await service.save();
      res.json(updatedService);
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete service (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (service) {
      await service.deleteOne();
      res.json({ message: 'Service removed' });
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
