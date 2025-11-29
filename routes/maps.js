import express from 'express';
import axios from 'axios';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

// Geocoding API endpoint
router.post('/geocode', authenticateJWT, async (req, res) => {
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ message: 'Address is required for geocoding' });
  }

  try {
    const apiKey = process.env.GOOGLE_GEOCODING_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_GEOCODING_API_KEY is not set in environment variables.');
      return res.status(500).json({ message: 'Server configuration error: Geocoding API key missing.' });
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: address,
        key: apiKey,
      },
    });

    const data = response.data;

    if (data.status === 'OK' && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      res.json({ lat, lng, formattedAddress: data.results[0].formatted_address });
    } else if (data.status === 'ZERO_RESULTS') {
      res.status(404).json({ message: 'No results found for the given address.' });
    } else {
      console.error('Google Geocoding API error:', data.error_message || data.status);
      res.status(500).json({ message: data.error_message || 'Error geocoding address.' });
    }
  } catch (err) {
    console.error('Server error during geocoding:', err);
    res.status(500).json({ message: 'Server error during geocoding.' });
  }
});

export default router;
