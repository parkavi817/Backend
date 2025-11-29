import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import Alert from '../models/Alert.js';

const router = express.Router();

// Simple placeholder dashboard data – replace with real logic as needed
router.get('/', authenticateJWT, async (req, res) => {
  try {
    // Fetch alerts for the authenticated user
    const alerts = await Alert.find({ userId: req.user.id }).sort({ timestamp: -1 });

    // Example combined data; you can pull other data (crops, schemes, etc.) here
    const data = {
      message: 'Dashboard endpoint is working',
      timestamp: new Date().toISOString(),
      alerts
    };
    res.json(data);
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
