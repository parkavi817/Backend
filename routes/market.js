import express from 'express';
const router = express.Router();
import axios from 'axios';

router.get('/', async (req, res) => {
    try {
        const apiKey = '579b464db66ec23bdd000001efd230d078864d2d5a2f043bb8f5629b';
        const resourceId = '9ef84268-d588-465a-a308-a864a43d0070';
        const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json`;

        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching market price data:', error);
        res.status(500).json({ message: 'Failed to fetch market price data' });
    }
});

export default router;