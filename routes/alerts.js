import express from 'express';
import { t } from '../utils/translate.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const router = express.Router();
import Alert from '../models/Alert.js'; // Our new Alert model
import { authenticateJWT } from '../middleware/auth.js';

// GET /api/alerts - Get all alerts for the authenticated user
router.get('/', authenticateJWT, async (req, res) => {
  const lang = req.headers['accept-language']?.split(',')[0].split('-')[0] || 'en';
  try {
    // Optionally filter by acknowledged status, e.g., /api/alerts?acknowledged=false
    const filter = { userId: req.user.id };
    if (req.query.acknowledged !== undefined) {
      filter.acknowledged = req.query.acknowledged === 'true';
    }

    const alerts = await Alert.find(filter).sort({ timestamp: -1 }); // Sort by newest first
    res.json(alerts);
  } catch (err) {
    console.error('Error fetching alerts:', err);
    res.status(500).json({ message: t('Server error', lang) });
  }
});

// PUT /api/alerts/:id/acknowledge - Acknowledge an alert
router.put('/:id/acknowledge', authenticateJWT, async (req, res) => {
  const lang = req.headers['accept-language']?.split(',')[0].split('-')[0] || 'en';
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { acknowledged: true } },
      { new: true } // Return the updated document
    );

    if (!alert) {
      return res.status(404).json({ message: t('Alert not found or unauthorized', lang) });
    }

    res.json(alert);
  } catch (err) {
    console.error('Error acknowledging alert:', err);
    res.status(500).json({ message: t('Server error', lang) });
  }
});

// DELETE /api/alerts/:id - Delete an alert (optional, for cleanup)
router.delete('/:id', authenticateJWT, async (req, res) => {
  const lang = req.headers['accept-language']?.split(',')[0].split('-')[0] || 'en';
  try {
    const alert = await Alert.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!alert) {
      return res.status(404).json({ message: t('Alert not found or unauthorized', lang) });
    }

    res.json({ message: t('Alert removed successfully', lang) });
  } catch (err) {
    console.error('Error deleting alert:', err);
    res.status(500).json({ message: t('Server error', lang) });
  }
});

export default router;