import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { Client } from '@gradio/client';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

let client;

// Connect to Gradio Space once
(async () => {
  client = await Client.connect("Parkavi0987/Agriml");
})();

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const filePath = path.resolve(req.file.path);

  try {
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;

    const result = await client.predict("/predict", { image: base64Image });

    fs.unlink(filePath, () => {}); // cleanup
    res.json(result.data);
  } catch (err) {
    fs.unlink(filePath, () => {});
    console.error(err);
    res.status(500).json({ error: 'Prediction failed', details: err.message });
  }
});

export default router;
