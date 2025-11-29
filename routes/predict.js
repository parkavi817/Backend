import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Forward the uploaded image to the Flask prediction service
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = path.resolve(req.file.path);
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    // Load the ML model URL from the environment variable
    const ML_API = process.env.ML_MODEL_API_URL;

    if (!ML_API) {
      return res.status(500).json({ error: "ML_MODEL_API_URL not configured" });
    }

    const flaskResponse = await axios.post(ML_API, form, {
      headers: form.getHeaders(),
    });

    // Clean up the uploaded file
    fs.unlink(filePath, () => {});

    // Return the Flask prediction directly to the client
    res.status(200).json(flaskResponse.data);

  } catch (error) {
    console.error('Prediction error:', error.message);
    res.status(500).json({
      error: 'Failed to get prediction from ML model',
      details: error.message,
    });
  }
});

export default router;