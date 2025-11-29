const express = require('express');
const Farm = require('../models/Farm');

const router = express.Router();

// Get all farms for user
router.get('/', async (req, res) => {
  try {
    const farms = await Farm.find({ userId: req.user.id }); // Changed 'user' to 'userId'
    res.json(farms);
  } catch (err) {
    console.error('Error fetching farms:', err); // Add logging for GET route as well
    console.error('Error stack:', err.stack);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new farm
router.post('/', async (req, res) => {
  console.log('Attempting to add new farm...'); // Log to confirm entry
  try {
    const { name, lat, lng, cropType, area, soilType, alertsEnabled } = req.body;
    const farm = new Farm({
      userId: req.user.id, // Changed from 'user' to 'userId' to match schema
      name,
      lat,
      lng,
      cropType,
      area,
      soilType,
      alertsEnabled: alertsEnabled !== undefined ? alertsEnabled : true
    });
    await farm.save();
    res.status(201).json(farm);
  } catch (err) {
    console.error('Error adding new farm:', err); // Log the error object
    console.error('Error stack:', err.stack); // Log the stack trace
    res.status(500).json({ message: 'Server error' });
  }
});

// Update farm
router.put('/:id', async (req, res) => {
  try {
    const farm = await Farm.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!farm) return res.status(404).json({ message: 'Farm not found' });
    res.json(farm);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete farm
router.delete('/:id', async (req, res) => {
  try {
    const farm = await Farm.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!farm) return res.status(404).json({ message: 'Farm not found' });
    res.json({ message: 'Farm deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
