import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import UserCropProgress from '../models/UserCropProgress.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// ✅ Auth middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// ✅ Safe user response
function getSafeUserResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    farmLocation: user.farmLocation || '',
    farmSize: user.farmSize || '',
    cropTypes: user.cropTypes || [],
    soilType: user.soilType || '',
    preferences: {
      theme: user.preferences?.theme ?? 'light',
      language: user.preferences?.language ?? 'en',
      notifications: {
        weather: user.preferences?.notifications?.weather ?? true,
        schemes: user.preferences?.notifications?.schemes ?? true,
        pestAlerts: user.preferences?.notifications?.pestAlerts ?? true,
        priceUpdates: user.preferences?.notifications?.priceUpdates ?? false,
        email: user.preferences?.notifications?.email ?? true,
        sms: user.preferences?.notifications?.sms ?? false
      }
    }
  };
}

// ✅ GET /profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(getSafeUserResponse(user));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ PUT /profile (safe merge and save)
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    console.log('Backend received profile update request with body:', updates);

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Merge updates, ensuring deep merge for preferences and notifications
    if (updates.name) user.name = updates.name;
    if (updates.phone) user.phone = updates.phone;
    if (updates.farmLocation) user.farmLocation = updates.farmLocation;
    if (updates.farmSize) user.farmSize = updates.farmSize;
    if (updates.cropTypes) user.cropTypes = updates.cropTypes;
    if (updates.soilType) user.soilType = updates.soilType;

    if (updates.preferences && typeof updates.preferences === 'object') {
      user.preferences = user.preferences || {}; // Ensure preferences object exists
      
      if (updates.preferences.theme) {
        user.preferences.theme = updates.preferences.theme;
      }
      if (updates.preferences.language) {
        user.preferences.language = updates.preferences.language;
      }

      if (updates.preferences.notifications && typeof updates.preferences.notifications === 'object') {
        user.preferences.notifications = user.preferences.notifications || {}; // Ensure notifications object exists
        Object.assign(user.preferences.notifications, updates.preferences.notifications);
      }
    }

    await user.save(); // ✅ Safe persist

    res.json(getSafeUserResponse(user));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ PUT /change-password
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/user/track-crop-view - Track when a user views a crop
router.post('/track-crop-view', authMiddleware, async (req, res) => {
  const { cropId } = req.body;

  if (!cropId) {
    return res.status(400).json({ message: 'Crop ID is required' });
  }

  try {
    // Check if the user has already viewed this crop recently (e.g., within the last hour)
    const existingView = await UserCropProgress.findOne({
      userId: req.user.id,
      cropId: cropId,
      viewedAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last 1 hour
    });

    if (existingView) {
      return res.status(200).json({ message: 'Crop view already recorded recently' });
    }

    const newView = new UserCropProgress({
      userId: req.user.id,
      cropId: cropId,
    });

    await newView.save();
    res.status(201).json({ message: 'Crop view recorded successfully' });
  } catch (err) {
    console.error('Error tracking crop view:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/user/crop-progress - Get user's crop knowledge progress
router.get('/crop-progress', authMiddleware, async (req, res) => {
  try {
    // Get unique crop IDs viewed by the user
    const uniqueViewedCrops = await UserCropProgress.distinct('cropId', { userId: req.user.id });
    
    // For now, let's assume a total number of crops for progress calculation
    // In a real app, you'd fetch this from a 'Crop' model or a predefined list
    const totalCropsInKnowledgeBase = 50; // Placeholder: Adjust as per your actual crop knowledge base

    const progressPercentage = (uniqueViewedCrops.length / totalCropsInKnowledgeBase) * 100;

    res.json({
      viewedCropsCount: uniqueViewedCrops.length,
      totalCrops: totalCropsInKnowledgeBase,
      progressPercentage: Math.min(100, Math.round(progressPercentage)), // Cap at 100%
      viewedCropIds: uniqueViewedCrops,
    });
  } catch (err) {
    console.error('Error fetching crop progress:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;