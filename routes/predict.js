import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { Client } from '@gradio/client';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

let client;

// Connect to Gradio Space once when the server starts
(async () => {
  client = await Client.connect("Parkavi0987/Agriml");
})();

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const filePath = path.resolve(req.file.path);

  try {
    // Read file as buffer
    const imageBuffer = fs.readFileSync(filePath);

    // Call Gradio Space /predict endpoint
    const result = await client.predict("/predict", { image: imageBuffer });

    fs.unlink(filePath, () => {}); // clean up uploaded file
    res.json(result.data);
  } catch (err) {
    fs.unlink(filePath, () => {});
    console.error(err);
    res.status(500).json({ error: 'Prediction failed', details: err.message });
  }
});

export default router;
