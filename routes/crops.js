import express from 'express';
const router = express.Router();

// Mock data for crop suitability based on soil type
const cropSuitabilityData = {
  'Clay': ['Rice', 'Wheat', 'Sugarcane', 'Cotton'],
  'Loamy': ['Wheat', 'Maize', 'Sugarcane', 'Vegetables', 'Pulses'],
  'Sandy': ['Groundnut', 'Millet', 'Watermelon', 'Some Vegetables'],
  'Sandy Loam': ['Wheat', 'Maize', 'Pulses', 'Oilseeds', 'Vegetables'],
  'Black Cotton': ['Cotton', 'Soybean', 'Wheat', 'Sorghum'],
  'Red': ['Groundnut', 'Ragi', 'Pulses', 'Some Vegetables'],
  '': ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Pulses', 'Oilseeds', 'Vegetables'] // Default if no soil type
};

// GET /api/crops/suitable?soilType=...
router.get('/suitable', async (req, res) => {
  try {
    const { soilType } = req.query;
    const suitableCrops = cropSuitabilityData[soilType] || cropSuitabilityData[''];
    res.json({ soilType: soilType || 'N/A', suitableCrops });
  } catch (err) {
    console.error('Error fetching suitable crops:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
