import express from 'express';
import GovernmentScheme from '../models/GovernmentScheme.js';
import User from '../models/User.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

// GET /api/schemes - Get all government schemes with optional search and category filter
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) {
      filter.category = category;
    }
    const schemes = await GovernmentScheme.find(filter).sort({ popularity: -1 });
    res.json(schemes);
  } catch (err) {
    console.error('Error fetching schemes:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/schemes/eligible - Get schemes eligible for the current user (protected)
router.get('/eligible', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const eligibleSchemes = [];

    // Mock eligibility logic based on user data
    if (user.farmLocation && user.farmLocation.toLowerCase().includes('punjab')) {
      eligibleSchemes.push({
        _id: 'scheme-pb-1',
        name: 'Punjab Farm Modernization Scheme',
        description: 'Financial assistance for modernizing farming equipment in Punjab.',
        category: 'Equipment',
        eligibility: 'Farmers in Punjab',
        link: 'https://example.com/punjab-scheme',
        imageUrl: 'https://via.placeholder.com/150/FF5733/FFFFFF?text=Punjab'
      });
    }

    if (user.cropTypes && user.cropTypes.includes('Rice')) {
      eligibleSchemes.push({
        _id: 'scheme-rice-1',
        name: 'Rice Cultivation Subsidy',
        description: 'Subsidy for farmers cultivating rice, promoting sustainable practices.',
        category: 'Subsidy',
        eligibility: 'Farmers cultivating Rice',
        link: 'https://example.com/rice-scheme',
        imageUrl: 'https://via.placeholder.com/150/33FF57/FFFFFF?text=Rice'
      });
    }

    if (user.farmSize && user.farmSize > 5) {
      eligibleSchemes.push({
        _id: 'scheme-large-farm-1',
        name: 'Large Farm Development Program',
        description: 'Support for large-scale agricultural development projects.',
        category: 'Development',
        eligibility: 'Farmers with more than 5 acres',
        link: 'https://example.com/large-farm-scheme',
        imageUrl: 'https://via.placeholder.com/150/3357FF/FFFFFF?text=LargeFarm'
      });
    }

    // General scheme always eligible
    eligibleSchemes.push({
      _id: 'scheme-general-1',
      name: 'Kisan Credit Card Scheme',
      description: 'Provides adequate and timely credit support to farmers.',
      category: 'Credit',
      eligibility: 'All farmers',
      link: 'https://example.com/kcc-scheme',
      imageUrl: 'https://via.placeholder.com/150/FFFF33/000000?text=KCC'
    });

    res.json(eligibleSchemes);
  } catch (err) {
    console.error('Error fetching eligible schemes:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
