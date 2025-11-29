import express from 'express';
import { t } from '../utils/translate.js';
import User from '../models/User.js';

const router = express.Router();

// Get user settings (profile, notifications, theme, language)
router.get('/', async (req, res) => {
  const lang = req.headers['accept-language']?.split(',')[0].split('-')[0] || 'en';
  try {
    const user = await User.findById(req.user.id).select('name email phone farmLocation farmSize cropTypes soilType preferences');
    if (!user) return res.status(404).json({ message: t('User not found', lang) });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: t('Server error', lang) });
  }
});

// Update user settings
router.put('/', async (req, res) => {
  const lang = req.headers['accept-language']?.split(',')[0].split('-')[0] || 'en';
  try {
    const updates = req.body;
    // Only allow updates to specific fields to prevent unwanted changes
    const allowedUpdates = ['name', 'email', 'phone', 'farmLocation', 'farmSize', 'cropTypes', 'soilType', 'preferences'];
    const filteredUpdates = {};
    for (const key of allowedUpdates) {
      if (Object.prototype.hasOwnProperty.call(updates, key)) {
        filteredUpdates[key] = updates[key];
      }
    }
    const user = await User.findByIdAndUpdate(req.user.id, filteredUpdates, { new: true }).select('name email phone farmLocation farmSize cropTypes soilType preferences');
    if (!user) return res.status(404).json({ message: t('User not found', lang) });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: t('Server error', lang) });
  }
});

// Change password
router.put('/password', async (req, res) => {
  const lang = req.headers['accept-language']?.split(',')[0].split('-')[0] || 'en';
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ message: t('Current and new password required', lang) });

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: t('User not found', lang) });

    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: t('Current password is incorrect', lang) });

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: t('Password changed successfully', lang) });
  } catch (err) {
    res.status(500).json({ message: t('Server error', lang) });
  }
});

export default router;
