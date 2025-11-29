import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({ name, email, passwordHash });
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET);

    res.status(201).json({ 
      token, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        farmLocation: user.farmLocation || '',
        farmSize: user.farmSize || 0,
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
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        farmLocation: user.farmLocation || '',
        farmSize: user.farmSize || 0,
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
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
