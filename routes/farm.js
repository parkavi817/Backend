import express from 'express';
import Farm from '../models/Farm.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

// POST /api/farms - Add a new farm
router.post('/', authenticateJWT, async (req, res) => {
  const { name, lat, lng, cropType, area, soilType } = req.body;

  if (!name || !lat || !lng || !cropType || !area || !soilType) {
    return res.status(400).json({ message: 'Please enter all required farm fields' });
  }

  try {
    const newFarm = new Farm({
      userId: req.user.id,
      name,
      lat,
      lng,
      cropType,
      area,
      soilType,
    });

    const farm = await newFarm.save();
    res.status(201).json(farm);
  } catch (err) {
    console.error('Error adding farm:', err);
    if (err.code === 11000) { // Duplicate key error
      return res.status(400).json({ message: 'A farm with this name already exists for your account.' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/farms - Get all farms for the authenticated user
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const farms = await Farm.find({ userId: req.user.id });
    res.json(farms);
  } catch (err) {
    console.error('Error fetching farms:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/farms/:id - Update a specific farm
router.put('/:id', authenticateJWT, async (req, res) => {
  const { name, lat, lng, cropType, area, soilType, alertsEnabled } = req.body;

  try {
    let farm = await Farm.findOne({ _id: req.params.id, userId: req.user.id });

    if (!farm) {
      return res.status(404).json({ message: 'Farm not found or unauthorized' });
    }

    // Update fields if provided
    if (name !== undefined) farm.name = name;
    if (lat !== undefined) farm.lat = lat;
    if (lng !== undefined) farm.lng = lng;
    if (cropType !== undefined) farm.cropType = cropType;
    if (area !== undefined) farm.area = area;
    if (soilType !== undefined) farm.soilType = soilType;
    if (alertsEnabled !== undefined) farm.alertsEnabled = alertsEnabled;

    await farm.save();
    res.json(farm);
  } catch (err) {
    console.error('Error updating farm:', err);
    if (err.code === 11000) { // Duplicate key error
      return res.status(400).json({ message: 'A farm with this name already exists for your account.' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/farms/:id - Delete a specific farm
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const farm = await Farm.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!farm) {
      return res.status(404).json({ message: 'Farm not found or unauthorized' });
    }

    res.json({ message: 'Farm removed successfully' });
  } catch (err) {
    console.error('Error deleting farm:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;